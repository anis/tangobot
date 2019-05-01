module.exports = function (config, page, helpers, words) {
    var handlers = {};
    handlers.giphy = require('./giphy')(config, page, helpers);
    handlers.grat = require('./grat')(config, page, helpers);
    handlers['grat.stats'] = require('./grat.stats')(config, page, helpers);
    handlers.greet = require('./greet')(config, page, helpers);
    handlers.imitate = require('./imitate')(config, page, helpers);
    handlers.naturalLanguage = require('./naturalLanguage')(config, page, helpers, words);
    handlers.timer = require('./timer')(config, page, helpers);

    return handlers;
};