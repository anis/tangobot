var fs = require('fs');

module.exports = function (config, page, helpers) {
    // local memory
    if (!fs.exists(config.dataSrc + '/sujet.json')) {
        fs.write(config.dataSrc + '/sujet.json', '0', 'w');
    }

    var count = JSON.parse(fs.read(config.dataSrc + '/sujet.json'));

    /**
     * @param {Number} total
     *
     * @returns {undefined}
     */
    function addToCount(total) {
        count += total;
        fs.write(config.dataSrc + '/sujet.json', JSON.stringify(count), 'w');
    }

    function respondCountTo(user) {
        helpers.chatango.message.send('@' + user + ' Suripapattes a parlé ' + count + ' fois du sujet');
    }

    return {
        push: function process(messages) {
            for (var i = 0; i < messages.length; i += 1) {
                if (messages[i].request !== null && messages[i].request.type === 'sujet') {
                    respondCountTo(messages[i].user);
                    continue;
                }

                if (messages[i].user.toLowerCase() === 'suripapattes') {
                    const match = messages[i].message.match(/^sujet|\ssujet\s|sujet$/g);
                    if (match !== null) {
                        addToCount(match.length);
                    }
                }
            }
        }
    };
};