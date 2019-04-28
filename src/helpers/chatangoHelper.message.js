/**
 * If a user sends the message "/requestType arg1   arg2 arg3
 * 
 * arg4"
 * 
 * The related request will be:
 * {
 *    type: 'requestType',
 *    args: ['arg1', 'arg2', 'arg3', 'arg4']
 * }
 * 
 * All whitespaces are removed from the arguments.
 * 
 * @typedef {Object} Request
 * @property {string}         type Request type
 * @property {Array.<string>} args Request arguments
 */

/**
 * @typedef {Object} ParsedMessage
 * @property {string}       user    The author of the message
 * @property {string}       message The raw message, without the username
 * @property {Request|null} request The request, if any was found
 */

module.exports = function (config, page, helpers) {
    return {
        /**
         * Sends the given message
         * 
         * @param {string}   message
         * @param {Function} [successCallback]
         * @param {Function} [failureCallback]
         */
        send: function (message, successCallback, failureCallback) {
            helpers.browser.type(
                message,
                '#input-field',
                true,
                successCallback,
                failureCallback
            );
        },

        /**
         * Parses the given raw message
         * 
         * @param {string} message
         * 
         * @returns {ParsedMessage}
         */
        parse: function (message) {
            var parts = message.match(/^([^:]+): (.+)$/i);
            if (parts === null) {
                return null;
            }

            var requestParts = parts[2].match(/^\/([a-zA-Z]+)\s+(.+?)\s*$/);
            var request = null;
            if (requestParts !== null) {
                request = {
                    type: requestParts[1],
                    args: requestParts[2].replace(/\s+/g, ' ').split(' ')
                };
            }

            return {
                user: parts[1],
                message: parts[2],
                request: request
            };
        }
    };
};