module.exports = function (config, page, helpers, requestHandlers) {
    /**
     * Finds all messages that are were not cleared yet
     * 
     * @returns {Array.<ParsedMessage>}
     */
    function getPendingMessages() {
        // get the raw messages
        var rawMessages = page.evaluate(function () {
            var elements = document.querySelectorAll(
                '#OM > .msg > .msg-fg:not(.clear)'
            );

            var i = 0;
            var messages = [];
            for (var i = 0; i < elements.length; i += 1) {
                elements[i].classList.add('clear');
                var messageContainer = elements[i].querySelector(
                    '.user-thumb ~ div:last-of-type > p',
                    '.user-thumb ~ div:last-of-type > p > span:nth-child(2)'
                );

                if (messageContainer) {
                    messages.push(messageContainer.textContent);
                }
            }

            return messages;
        });

        // parse them all
        var parsedMessages = [];
        for (var i = 0; i < rawMessages.length; i += 1) {
            var parsedMessage = helpers.chatango.message.parse(rawMessages[i]);
            if (parsedMessage !== null) {
                parsedMessages.push(parsedMessage);
            }
        }

        return parsedMessages;
    }

    /**
     * 
     */
    function processPendingMessages() {
        var messages;
        try {
            messages = getPendingMessages();
        } catch (error) {
            console.log('Failed retrieving pending messages');
            console.log('Asking for a restart');
            restart();
            return;
        }

        if (messages.length > 0) {
            for (var handlerName in requestHandlers) {
                if (requestHandlers.hasOwnProperty(handlerName)) {
                    try {
                        requestHandlers[handlerName].push(messages);
                    } catch (error) {
                        console.log('Failed pushing messages to handler: ' + handlerName);
                        console.log(error);
                    }
                }
            }
        }

        // check if connection was lost
        var response = undefined;
        try {
            response = page.evaluate(function () {
                var el = document.querySelector('#CUI');
                if (!el) {
                    return 'could not find element';
                }

                return el.textContent.indexOf('Impossible de se connecter') >= 0;
            });
        } catch (error) {
            console.log('Failed checking connection state', error);
            response = undefined;
        }

        if (response !== false) {
            console.log('Disconnected');
            console.log('Asking for a restart');
            restart();
        } else {
            window.requestAnimationFrame(processPendingMessages);
        }
    }

    /**
     * Initializes all request handlers
     * 
     * @returns {undefined}
     */
    function initHandlers() {
        for (var handlerName in requestHandlers) {
            if (requestHandlers.hasOwnProperty(handlerName)) {
                try {
                    if (requestHandlers[handlerName].init) {
                        requestHandlers[handlerName].init();
                    }
                } catch (error) {
                    console.log('Failed initializing handler: ' + handlerName);
                    console.log(error);
                }
            }
        }
    }

    // open the chat group and start listening to requests
    function start() {
        helpers.chatango.openAs(
            page,
            config.bot.group,
            config.bot.credentials,
            function () {
                getPendingMessages(); // clear initial messages
                initHandlers();
                window.requestAnimationFrame(processPendingMessages);
            },
            restart
        );
    }

    function restart() {
        console.log('Restarting the page');
        page.close();
        setTimeout(start, 10000);
    }

    start();
};