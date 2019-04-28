var webpage = require('webpage').create();
var config = require('./config');
var helpers = require('./helpers')(config, webpage);
var requestHandlers = require('./lib/requestHandlers')(config, webpage, helpers);

// start listening to requests
require('./lib/listener')(config, webpage, helpers, requestHandlers);
