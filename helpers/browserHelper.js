module.exports = function (config) {
    var DEFAULT_DELAY = config.browser.delayBeforeRetry;
    var DEFAULT_NUMBER_OF_TRIALS = config.browser.numberOfTrialsBeforeFailure;

    return {
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