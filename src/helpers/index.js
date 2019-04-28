module.exports = function (config, page) {
    var helpers = {};
    helpers.browser = require('./browserHelper')(config, page, helpers);
    helpers.chatango = require('./chatangoHelper')(config, page, helpers);
    helpers.naturalLanguage = require('./naturalLanguageHelper')(config, page, helpers);

    return helpers;
};