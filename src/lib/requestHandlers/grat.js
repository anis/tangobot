module.exports = function (config, page, helpers) {
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

        return now.getHours() === parseInt(expected[0], 10) && now.getMinutes() === parseInt(expected[1]);
    }

    /**
     * Sends the message '*grat*' to a user
     * 
     * @param {string} username
     */
    function grat(username) {
        helpers.chatango.message.send('@' + username + ' *grat*');
    }

    return {
        push: function process(messages) {
            for (var i = 0; i < messages.length; i += 1) {
                if (isHourMessage(messages[i].message) && isMessageMatchingRealHour(messages[i].message)) {
                    grat(messages[i].user);
                }
            }
        }
    };
};