module.exports = function (config, page, helpers, words) {
    var handlers = {};
    handlers.giphy = require('./giphy')(config, page, helpers);
    handlers.naturalLanguage = require('./naturalLanguage')(config, page, helpers, words);

    return handlers;
};