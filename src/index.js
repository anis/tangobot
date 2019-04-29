var webpage = require('webpage').create();
var words = require('../data/words.js');
var config = require('./config');
var helpers = require('./helpers')(config, webpage);
var requestHandlers = require('./lib/requestHandlers')(config, webpage, helpers, words);

// // start listening to requests
require('./lib/listener')(config, webpage, helpers, requestHandlers);
