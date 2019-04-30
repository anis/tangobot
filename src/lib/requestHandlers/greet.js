module.exports = function (config, page, helpers) {
    var greetWords = [
        'bonjour', 'bonsoir', 'salut', 'plop', 'yo',
        'hello', 'coucou', 'hey', 'kikou', 'wesh',
        'bonsoir'
    ];

    var startTime = Date.now();
    var silenceDelay = 2 * 60 * 60 * 1000; // 2 hours
    var lastMessageByUser = {};

    function isGreeting(message) {
        return greetWords.indexOf(message.toLowerCase()) >= 0;
    }

    function isNewlyActive(user) {
        return !lastMessageByUser[user] || (Date.now() - lastMessageByUser[user]) >= silenceDelay;
    }

    function randomGreetWord() {
        return greetWords[Math.round(Math.random() * (greetWords.length - 1))];
    }

    return {
        push: function process(messages) {

            for (var i = 0; i < messages.length; i += 1) {
                if ((Date.now() - startTime) >= silenceDelay) {
                    if (isGreeting(messages[i].message) && isNewlyActive(messages[i].user)) {
                        helpers.chatango.message.send('@' + messages[i].user + ' ' + randomGreetWord() + ' !');
                    }
                }

                lastMessageByUser[messages[i].user] = Date.now();
            }
        }
    };
};