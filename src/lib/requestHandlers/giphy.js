/**
 * @typedef {Object} RequestInfo
 * @property {number}  issuedAt Timestamp, in milliseconds, at which the request was issued
 * @property {boolean} pending  Wether the request is still pending
 */

module.exports = function (config, page, helpers) {
    /**
     * Requests a gif/sticker from giphy
     * 
     * @param {string}   imgType         Either 'gif' or 'sticker'
     * @param {string}   search          The tags to be used for search
     * @param {Function} successCallback
     * @param {Function} failureCallback
     */
    function getAGiphy(imgType, search, successCallback, failureCallback) {
        var xhr = new XMLHttpRequest();
        xhr.open(
            'GET',
            'https://api.giphy.com/v1/' + imgType + 's/random?api_key=' + config.giphy.apiKey + '&tag=' + encodeURIComponent(search) + '&rating=R',
            true
        );
        xhr.onload = function () {
            try {
                var response = JSON.parse(this.response);
                if (response.data && response.data.images && response.data.images.original) {
                    successCallback(response.data.images.original.url);
                } else {
                    failureCallback();
                }
            } catch(error) {
                failureCallback();
            }
        };
        xhr.onerror = function () {
            failureCallback();
        };
        xhr.ontimeout = function () {
            failureCallback();
        };
        xhr.onabort = function () {
            failureCallback();
        };
        xhr.send();
    }

    /**
     * Data about the last request issued by each user
     * 
     * A map between a username and its last request.
     * 
     * @type {Object.<string,RequestInfo>}
     */
    var lastRequests = {};

    /**
     * Executes the request from the given message
     * 
     * Please note that this function assumes the given message
     * contains a valid giphy request.
     * 
     * @param {ParsedMessage} message
     */
    function executeRequest(message) {
        lastRequests[message.user] = {
            pending: true,
            issuedAt: Date.now()
        };

        getAGiphy(
            message.request.type,
            message.request.args.join(' '),
            function (imgSrc) {
                lastRequests[message.user].pending = false;
                helpers.chatango.message.send('@' + message.user + ' ' + imgSrc);
            },
            function () {
                lastRequests[message.user].pending = false;
                helpers.chatango.message.send('@' + message.user + ' ' + helpers.naturalLanguage.buildASorryMessage());
            }
        );
    }

    /**
     * Filters out all messages that do not contain a giphy request
     * 
     * Please note that if multiple giphy requests are found for a same user,
     * the last one only will be returned.
     * 
     * @param {Array.<ParsedMessage>} messages List of messages
     * 
     * @returns {Array<ParsedMessage>}
     */
    function extractGiphyMessagesByUser(messages) {
        var giphyMessagesByUser = {};
        for (var i = 0; i < messages.length; i += 1) {
            if (messages[i].request !== null && ['gif', 'sticker'].indexOf(messages[i].request.type) >= 0) {
                giphyMessagesByUser[messages[i].user] = messages[i];
            }
        }

        var giphyMessages = [];
        for (var user in giphyMessagesByUser) {
            if (giphyMessagesByUser.hasOwnProperty(user)) {
                giphyMessages.push(giphyMessagesByUser[user]);
            }
        }

        return giphyMessages;
    }

    /**
     * Filters out all messages containing an invalid giphy request
     * 
     * An invalid request is either:
     * - a request issued by user who already has a pending request
     * - a request issued by user too soon before his last request
     * 
     * @param {Array<ParsedMessage>} messages
     * 
     * @returns {Array<ParsedMessage>}
     */
    function filterValidMessages(messages) {
        var validMessages = [];
        var now = Date.now();
        for (var i = 0; i < messages.length; i += 1) {
            var user = messages[i].user;
            if (lastRequests[user] !== undefined) {
                if (lastRequests[user].pending === true) {
                    continue;
                }

                var delay = now - lastRequests[user].issuedAt;
                if (delay < config.bot.minimumDelayBetweenRequests) {
                    continue;
                }
            }

            validMessages.push(messages[i]);
        }

        return validMessages;
    }

    /**
     * Filters out all messages that do not contain a valid giphy request
     * 
     * @param {Array.<ParsedMessage>} messages List of messages
     * 
     * @returns {Array<ParsedMessage>}
     */
    function getValidMessages(messages) {
        return filterValidMessages(
            extractGiphyMessagesByUser(messages)
        );
    }

    return {
        push: function process(messages) {
            var validMessages = getValidMessages(messages);
            for (var i = 0; i < validMessages.length; i += 1) {
                executeRequest(validMessages[i]);
            }
        }
    };
};