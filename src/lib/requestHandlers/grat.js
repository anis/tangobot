var fs = require('fs');

module.exports = function (config, page, helpers) {
    // stats
    if (!fs.exists(config.dataSrc + '/grat.stats.json')) {
        fs.write(config.dataSrc + '/grat.stats.json', '{}', 'w');
    }

    /**
     * List of grats received by each user, grouped by hours
     *
     * Example:
     * {
     *  username: {
     *      '11h11': 2,
     *      '22h22': 1,
     *      ...
     *  },
     *  ...
     * }
     *
     * @type {Object}
     */
    var stats = JSON.parse(
        fs.read(config.dataSrc + '/grat.stats.json')
    ) || {};

    /**
     * Checks if the given message is an "hour message"
     * 
     * @param {string} message
     * 
     * @returns {boolean}
     */
    function isHourMessage(message) {
        return message.match(/^[0-9]{2}h[0-9]{2}$/g) !== null;
    }

    function reverse(str) {
        var reversed = '';
        for (var i = str.length - 1; i >= 0; i -= 1) {
            reversed += str[i];
        }

        return reversed;
    }

    /**
     * Checks if the given "hour message" matches the current time
     * 
     * @param {string} hour
     * 
     * @returns {boolean}
     */
    function isMessageMatchingRealHour(hour) {
        var expected = hour.split('h');
        var now = new Date();
        return now.getHours() === parseInt(expected[0], 10) && now.getMinutes() === parseInt(expected[1], 10);
    }

    /**
     * Checks if the given hour deserves a grat
     *
     * @param {string} hour
     *
     * @returns {boolean}
     */
    function isHourSpecial(hour) {
        var expected = hour.split('h');
        return expected[0] === reverse(expected[1])
            || expected[0] === expected[1]
            || (expected[0] === '01' && expected[1] === '23')
            || (expected[0] === '12' && expected[1] === '34')
            || (expected[0] === '23' && expected[1] === '45')
            || (expected[0] === '13' && expected[1] === '37');
    }

    /**
     * Sends the message '*grat*' to a user
     *
     * @param {string} username
     *
     * @returns {undefined}
     */
    function grat(username) {
        var now = new Date();
        setTimeout(function () {
            helpers.chatango.message.send('@' + username + ' *grat*');
        }, Math.max(2, Math.round(Math.random() * (59 - now.getSeconds()))) * 1000);
    }

    /**
     * Increments the score of the given user of 1 for the given hour
     *
     * @param {string} username
     * @param {string} hour
     *
     * @returns {undefined}
     */
    function saveToStats(username, hour) {
        if (!stats[username]) {
            stats[username] = {};
        }

        if (!stats[username][hour]) {
            stats[username][hour] = 0;
        }

        stats[username][hour] += 1;
        fs.write(config.dataSrc + '/grat.stats.json', JSON.stringify(stats), 'w');
    }

    return {
        push: function process(messages) {
            for (var i = 0; i < messages.length; i += 1) {
                if (isHourMessage(messages[i].message)
                    && isMessageMatchingRealHour(messages[i].message)
                    && isHourSpecial(messages[i].message)) {
                    saveToStats(messages[i].user, messages[i].message);
                    grat(messages[i].user);
                    return;
                }
            }
        }
    };
};