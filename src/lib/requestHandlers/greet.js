module.exports = function (config, page, helpers) {
    var greetWords = [
        'bonjour', 'bonsoir', 'salut', 'plop', 'yo',
        'hello', 'coucou', 'hey', 'kikou', 'wesh',
        'bonsoir', 'blop', 'yop', 'salutation',
        'salutations'
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

    function greet(user) {
        setTimeout(function () {
            helpers.chatango.message.send('@' + user + ' ' + randomGreetWord() + ' !');
        }, (Math.round(Math.random() * 3) + 2) * 1000);
    }

    return {
        push: function process(messages) {

            for (var i = 0; i < messages.length; i += 1) {
                if ((Date.now() - startTime) >= silenceDelay) {
                    if (isGreeting(messages[i].message) && isNewlyActive(messages[i].user)) {
                        greet(messages[i].user);
                    }
                }

                lastMessageByUser[messages[i].user] = Date.now();
            }
        }
    };
};