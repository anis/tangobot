var fs = require('fs');

module.exports = function (config, page, helpers) {
    // local memory
    if (!fs.exists(config.dataSrc + '/timer.json')) {
        fs.write(config.dataSrc + '/timer.json', '[]', 'w');
    }

    /**
     * A map that converts first person to second person pronouns
     *
     * (And the other way around)
     *
     * @type {Object.<string,string>}
     */
    var pronounTable = {
        'je': 'tu',
        'me': 'te',
        'm\'': 't\'',
        'm': 't',
        'moi': 'toi',
        'nous': 'vous',
        'mien': 'tien',
        'mienne': 'tienne',
        'miens': 'tiens',
        'miennes': 'tiennes',
        'nôtre': 'vôtre',
        'notre': 'votre',
        'nôtres': 'vôtres',
        'notres': 'votres',
        'mon': 'ton',
        'ma': 'ta',
        'mes': 'tes',
        'nos': 'vos',
    };

    for (var v in pronounTable) {
        if (pronounTable.hasOwnProperty(v)) {
            pronounTable[pronounTable[v]] = v;
        }
    }

    /**
     * List of verbs used for request detection
     * 
     * @type {Array.<Object>}
     */
    var verbs = [
        { infinitive: 'tagg?u?er', imperative: 'tag(?:gue)?' },
        { infinitive: 'rapp?ell?er', imperative: 'rapp?ell?e' }
    ];

    // build the regexps part for the verbs
    var infinitives = [];
    for (var i = 0; i < verbs.length; i += 1) {
        infinitives.push(verbs[i].infinitive);
    }

    var imperatives = [];
    for (var i = 0; i < verbs.length; i += 1) {
        imperatives.push(verbs[i].imperative);
    }

    /**
     * List of regexps detecting a request
     * 
     * "wording" is used to respond to the user when times comes
     * to remember him his request
     * 
     * "reg" is, obviously, the regexp
     * 
     * @type {Array.<Object>}
     */
    var regs = [
        {
            wording: 'je devais te',
            reg: new RegExp(
                '^@' + config.bot.credentials.username + '\\s+(?:est[\\s-]ce\\s+que\\s+)?tu\\s+(?:peux|pourrais?|pourras|veux\\s+bien|voudrais?\\s+bien|accepte\\s*de)\\s+me\\s+(' + infinitives.join('|') + ')\\s+(pour|de|d[\\s\'])\\s*(.+)\\s*dans\\s+([0-9]+\\s*(?:h|heures?|ms?|mns?|mins?|minutes?|js?|jours?))'
            )
        },
        {
            wording: 'il fallait que je te',
            reg: new RegExp(
                '^@' + config.bot.credentials.username + '\\s+(' + imperatives.join('|') + ')\\s+moi\\s+(pour|de|d[\\s\'])\\s*(.+)\\s*dans\\s+([0-9]+\\s*(?:h|heures?|ms?|mns?|mins?|minutes?|js?|jours?))'
            )
        }
    ];

    /**
     * Saves the given request to the cache file
     * 
     * @param {Object} request
     * 
     * @returns {undefined}
     */
    function saveRequestToMemory(request) {
        var requests = JSON.parse(fs.read(config.dataSrc + '/timer.json'));
        requests.push(request);
        fs.write(config.dataSrc + '/timer.json', JSON.stringify(requests), 'w');
    }

    /**
     * Removes outdated requests from the cache file
     * 
     * @returns {undefined}
     */
    function cleanOutdatedRequests() {
        var requests = JSON.parse(fs.read(config.dataSrc + '/timer.json'));
        var now = Date.now();
        var validRequests = [];
        for (var i = 0; i < requests.length; i += 1) {
            if (now - requests[i].ts > 0) {
                validRequests.push(requests[i]);
            }
        }

        fs.write(config.dataSrc + '/timer.json', JSON.stringify(validRequests), 'w');
    }

    /**
     * Schedules a request
     * 
     * @param {Object} request
     */
    function schedule(request) {
        var delay = request.ts - Date.now();
        if (delay <= 0) {
            return;
        }

        saveRequestToMemory(request);

        setTimeout(function () {
            cleanOutdatedRequests();
            helpers.chatango.message.send(
                '@' + request.user + ' ' + request.str
            );
        }, Math.max(1000, delay));
    }

    /**
     * Parses the delay found in a request, and converts it to a value in milliseconds
     * 
     * @param {string} delay Various formats, please see the regexp
     * 
     * @returns {number|null} Null if the delay could not be parsed
     */
    function fromDelayToTimestamp(delay) {
        var parts = delay.match(/^([0-9]+)\s*(.+)$/);

        var multiplier = 0;
        switch (parts[2]) {
            case 'h':
            case 'heure':
            case 'heures':
                multiplier = 60 * 60;
                break;

            case 'm':
            case 'ms':
            case 'mn':
            case 'mns':
            case 'min':
            case 'mins':
            case 'minute':
            case 'minutes':
                multiplier = 60;
                break;

            case 'j':
            case 'js':
            case 'jour':
            case 'jours':
                multiplier = 24 * 60 * 60;
                break;

            default:
                multiplier = 0;
        }

        return parseInt(parts[1], 10) * multiplier * 1000;
    }

    /**
     * Converts first person pronouns to second person
     *
     * @param {string} str
     *
     * @returns {string}
     */
    function convertFirstPerson(str) {
        var parts = str.split(' ');
        var converted = [];
        for (var i = 0; i < parts.length; i += 1) {
            var part = parts[i].toLowerCase();
            if (pronounTable.hasOwnProperty(part)) {
                converted.push(pronounTable[part]);
            } else {
                converted.push(parts[i]);
            }
        }

        return converted.join(' ');
    }

    /**
     * Parses a request and formats it to a storable format
     * 
     * @param {string} user  User that issued the request
     * @param {Object} reg   The reg that matched the request
     * @param {Array}  match The matched parts of the request
     * 
     * @returns {Object}
     */
    function parseRequest(user, reg, match) {
        var delay = fromDelayToTimestamp(match[4]);
        if (isNaN(delay) || delay <= 0) {
            return null;
        }

        return {
            user: user,
            str: reg.wording + ' ' + match[1] + ' ' + match[2] + ' ' + convertFirstPerson(match[3]),
            ts: Date.now() + delay
        };
    }

    /**
     * Checks if the given message contains a valid timer request
     * 
     * @param {ParsedMessage} message
     * 
     * @returns {undefined}
     */
    function processMessage(message) {
        for (var i = 0; i < regs.length; i += 1) {
            var match = message.message.match(regs[i].reg);
            if (match === null) {
                continue;
            }

            var request = parseRequest(message.user, regs[i], match);
            if (request !== null) {
                schedule(request);
                helpers.chatango.message.send(
                    '@' + message.user + ' ok ! :)'
                );
            }

            break;
        }
    }

    return {
        init: function () {
            // first of all, clean outdated requests
            cleanOutdatedRequests();

            // then schedule to answer to remaining requests
            var pendingRequests = JSON.parse(fs.read(config.dataSrc + '/timer.json'));
            for (var i = 0; i < pendingRequests.length; i += 1) {
                schedule(pendingRequests[i]);
            }
        },
        push: function process(messages) {
            for (var i = 0; i < messages.length; i += 1) {
                processMessage(messages[i]);
            }
        }
    };
};