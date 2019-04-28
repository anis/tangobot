module.exports = function (config, page, helpers)  {
    var handlers = {};
    handlers.giphy = require('./giphy')(config, page, helpers);

    return handlers;
};