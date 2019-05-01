module.exports = function (config, page, helpers, words) {
    var reg = new RegExp('^@' + config.bot.credentials.username);

    console.log('Filtering words to keep verbs only');
    var verbs = [];
    for (var i = 0; i < words.length; i += 1) {
        if (words[i].CA.categorie[0] === 'V') {
            verbs.push(words[i]);
        }
    }
    console.log('Done');

    /**
     * Analyzes the given message and responds with the main tone detected
     *
     * @param {string}   message
     * @param {Function} successCallback
     *
     * @returns {undefined}
     */
    function getTone(message, successCallback) {
        var xhr = new XMLHttpRequest();
        xhr.open(
            'POST',
            config.ibm.toneAnalyzer.url + '/v3/tone_chat?version=' + encodeURIComponent('2017-09-21'),
            true
        );
        xhr.setRequestHeader('Authorization', 'Basic ' + btoa('apikey:' + config.ibm.toneAnalyzer.apiKey));
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Content-Language', 'fr');
        xhr.onload = function () {
            var response = JSON.parse(this.response);

            var tones = response.utterances_tone[0].tones;
            var mainTone = null;
            for (var i = 0; i < tones.length; i += 1) {
                if (['impolite', 'satisfied', 'sad'].indexOf(tones[i].tone_id) === -1) {
                    continue;
                }

                if (mainTone === null || tones[i].score > mainTone.score) {
                    mainTone = tones[i];
                }
            }

            successCallback(mainTone);
        };
        xhr.send(JSON.stringify({
            utterances: [
                {
                    text: message,
                    user: 'customer'
                }
            ]
        }));
    }

    /**
     * Gets a random picture of a cat
     *
     * @param {Function} successCallback
     * @param {Function} faolureCallback
     *
     * @returns {undefined}
     */
    function getRandomCat(successCallback, failureCallback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://aws.random.cat/meow', true);
        xhr.onload = function () {
            try {
                var response = JSON.parse(this.response);
                successCallback(response.file);
            } catch (error) {
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
     * Gets a random picture of a dog
     *
     * @param {Function} successCallback
     * @param {Function} faolureCallback
     *
     * @returns {undefined}
     */
    function getRandomDog(successCallback, failureCallback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://dog.ceo/api/breeds/image/random', true);
        xhr.onload = function () {
            try {
                var response = JSON.parse(this.response);
                successCallback(response.message);
            } catch (error) {
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
     * Gets a random picture of a cute animal
     *
     * @param {Function} successCallback
     * @param {Function} faolureCallback
     *
     * @returns {undefined}
     */
    function getRandomAnimal(successCallback, failureCallback) {
        var animals = [getRandomCat, getRandomDog];
        animals[Math.round(Math.random() * (animals.length - 1))](
            successCallback,
            failureCallback
        );
    }

    /**
     * Gets a random verb from the word database
     *
     * @returns {string}
     */
    function getRandomVerb() {
        return verbs[Math.round(Math.random() * (verbs.length - 1))].M.mot;
    }

    /**
     * Responds to a user, based on his  tone
     *
     * @param {string}      username
     * @param {Object|null} tone
     */
    function reactToDm(username, tone) {
        if (tone === null) {
            return;
        }

        if (tone.score < 0.65) {
            return;
        }

        switch (tone.tone_id) {
            case 'impolite':
                helpers.chatango.message.send(
                    '@' + username + ' va bien ' + getRandomVerb() + ' tes morts'
                );
                break;

            case 'sad':
                getRandomAnimal(
                    function (imgSrc) {
                        helpers.chatango.message.send(
                            '@' + username + ' tu m\'as l\'air d\'avoir besoin de réconfort, alors tiens :',
                            function () {
                                setTimeout(function () {
                                    helpers.chatango.message.send(imgSrc);
                                }, 500);
                            }
                        );
                    },
                    function () {
                        helpers.chatango.message.send('@' + username + ' j\'ai pensé qu\'une image d\'animal mignon pourrait te réconforter, mais je n\'en ai pas trouvé :(');
                    }
                )
                break;
        }
    }

    return {
        push: function push(messages) {
            // keep only messages directed to the bot, and only one per user (the latest)
            var dms = {};
            for (var i = 0; i < messages.length; i += 1) {
                if (messages[i].request !== null) {
                    continue;
                }

                if (reg.test(messages[i].message) !== true) {
                    continue;
                }

                dms[messages[i].user] = messages[i];
            }

            // analyze the tone of each DM and respond accordingly
            for (var user in dms) {
                if (dms.hasOwnProperty(user)) {
                    getTone(
                        dms[user].message,
                        reactToDm.bind(this, user)
                    );
                }
            }
        }
    };
};