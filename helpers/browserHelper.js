module.exports = function (config) {
    var DEFAULT_DELAY = config.browser.delayBeforeRetry;
    var DEFAULT_NUMBER_OF_TRIALS = config.browser.numberOfTrialsBeforeFailure;

    return {
        /**
         * Waits for a specific element to appear inside the DOM tree
         * 
         * @param {string}   selector The selector of the expected element
         * @param {Function} callback Callback executed at either success or failure
         * @param {number}   [delay]  The delay, in milliseconds, before a new trial
         * @param {number}   [trials] The number of allowed trials before failing
         * 
         * @returns {undefined}
         */
        waitForElement: function waitForElement(selector, callback, delay, trials) {
            console.log('Looking for ' + selector);

            if (delay === undefined) {
                delay = DEFAULT_DELAY;
            }

            if (trials === undefined) {
                trials = DEFAULT_NUMBER_OF_TRIALS;
            }

            if (trials <= 0) {
                callback(null);
                return;
            }
        
            var element = page.evaluate(function (selector) {
                return document.querySelector(selector);
            }, selector);
        
            if (element) {
                callback(element);
            } else {
                setTimeout(waitForElement.bind(this, selector, callback, delay, trials - 1), delay);
            }
        }
    };
}