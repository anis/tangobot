module.exports = function (config, page, helpers) {
    var timeshift = 5 * 60 * 1000; // 2 minutes
    var expiracy  = 12 * 60 * 60 * 1000; // 12 hours
    var quota = 2;
    var dms = {};
    var sentImitations = {};

    /**
     * Checks if the given message is a DM
     * 
     * @param {string} message
     * 
     * @returns {Object|null}
     */
    function isDm(message) {
        var parts = message.match(/^@([^\s]+)\s+([^\s].+)$/);
        if (parts === null) {
            return parts;
        }

        return {
            user: parts[1],
            message: parts[2]
        };
    }

    /**
     * Checks if we already imitated the given dm recently
     * 
     * @param {Object} dm
     * 
     * @returns {boolean}
     */
    function alreadyImitated(dm) {
        if (!sentImitations[dm.user]) {
            return false;
        }

        for (var i = 0; i < sentImitations[dm.user].length; i += 1) {
            if (sentImitations[dm.user][i].message === dm.message) {
                return true;
            }
        }

        return false;
    }

    /**
     * Cleans all imitations we performed too long ago
     * 
     * @returns {undefined}
     */
    function cleanExpiredImitations() {
        var now = Date.now();
        for (var user in sentImitations) {
            if (sentImitations.hasOwnProperty(user)) {
                for (var i = 0; i < sentImitations[user].length; i += 1) {
                    if ((now - sentImitations[user][i].time) >= expiracy) {
                        sentImitations[user].splice(i, 1);
                        i -= 1;
                    }
                }
            }
        }
    }

    /**
     * Cleans all DMs that were issued too long ago
     * 
     * @param {string} user username
     * 
     * @returns {undefined}
     */
    function cleanExpiredDmsFor(user) {
        var now = Date.now();
        for (var i = 0; i < dms[user].length; i += 1) {
            if ((now - dms[user][i].time) >= timeshift) {
                dms[user].splice(i, 1);
                i -= 1;
            } 
        }
    }

    /**
     * Gets all DMs issued to a user with a specific message
     * 
     * @param {string} user
     * @param {string} message
     * 
     * @returns {Array.<Object>}
     */
    function getAllDms(user, message) {
        var list = [];
        for (var i = 0; i < dms[user].length; i += 1) {
            if (dms[user][i].message === message) {
                list.push(dms[user][i]);
            }
        }

        return list;
    }

    /**
     * Checks if the given message contains a DM, and imitate it if necessary
     * 
     * @param {ParsedMessage} message
     * 
     * @returns {undefined}
     */
    function imitate(message) {
        // check if the given message is a DM that is not directed to us, and we did not already imitate
        var dm = isDm(message.message);
        if (dm === null) {
            return;
        }

        if (dm.user === config.bot.credentials.username) {
            return;
        }

        if (alreadyImitated(dm)) {
            return;
        }

        // check if the author of the DM did not already send a same DM before
        if (!dms[dm.user]) {
            dms[dm.user] = [];
        } else {
            cleanExpiredDmsFor(dm.user);
        }

        var sameDms = getAllDms(dm.user, dm.message);
        for (var i = 0; i < sameDms.length; i += 1) {
            if (sameDms[i].author === message.user) {
                return;
            }
        }

        // add this message to the list of detected DMs
        dms[dm.user].push({
            author: message.user,
            time: Date.now(),
            message: dm.message
        });

        // if we reached the quota, imitate!
        if (sameDms.length + 1 >= quota) {
            setTimeout(function () {
                helpers.chatango.message.send('@' + dm.user + ' ' + dm.message);
            }, (Math.round(Math.random() * 5) + 5) * 1000);
        }
    }

    return {
        push: function process(messages) {
            cleanExpiredImitations();
            for (var i = 0; i < messages.length; i += 1) {
                imitate(messages[i]);
            }
        }
    };
};