module.exports = function (config) {
    var DEFAULT_DELAY = config.browser.delayBeforeRetry;
    var DEFAULT_NUMBER_OF_TRIALS = config.browser.numberOfTrialsBeforeFailure;

    return {
        /**
         * Waits for a specific element to appear inside the DOM tree
         * 
         * @param {string}   selector          The selector of the expected element
         * @param {Function} [successCallback] Callback executed in case of success
         * @param {Function} [failureCallback] Callback executed in case of failure
         * @param {number}   [delay]           The delay, in milliseconds, before a new trial
         * @param {number}   [trials]          The number of allowed trials before failing
         * 
         * @returns {undefined}
         */
        waitForElement: function waitForElement(selector, successCallback, failureCallback, delay, trials) {
            console.log('Looking for ' + selector);
            if (delay === undefined) {
                delay = DEFAULT_DELAY;
            }

            if (trials === undefined) {
                trials = DEFAULT_NUMBER_OF_TRIALS;
            }

            if (trials <= 0) {
                console.log('Failed');

                if (failureCallback) {
                    failureCallback();
                }

                return;
            }

            var element;
            try {
                element = page.evaluate(function (selector) {
                    return document.querySelector(selector);
                }, selector);
            } catch (error) {
                console.log(error);
                element = null;
            }
        
            if (element) {
                console.log('Succeeded');

                if (successCallback) {
                    successCallback(element);
                }
            } else {
                console.log('Failed attempt');
                setTimeout(waitForElement.bind(this, selector, successCallback, failureCallback, delay, trials - 1), delay);
            }
        },

        /**
         * Clicks on a DOM element
         * 
         * @param {string}   selector          Selector of the element to be clicked
         * @param {Function} [successCallback] Callback executed in case of success
         * @param {Function} [failureCallback] Callback executed in case of failure
         * @param {number}   [delay]           The delay, in milliseconds, before a new trial
         * @param {number}   [trials]          The number of allowed trials before failing
         * 
         * @returns {undefined}
         */
        click: function click(selector, successCallback, failureCallback, delay, trials) {
            console.log('Clicking on ' + selector);
            if (delay === undefined) {
                delay = DEFAULT_DELAY;
            }

            if (trials === undefined) {
                trials = DEFAULT_NUMBER_OF_TRIALS;
            }

            if (trials <= 0) {
                console.log('Failed');

                if (failureCallback) {
                    failureCallback();
                }

                return;
            }

            var response;
            try {
                response = page.evaluate(function (selector) {
                    var el = document.querySelector(selector);
                    if (!el) {
                        return 'could not find element';
                    }

                    var ce = document.createEvent('MouseEvent');
                    ce.initMouseEvent(
                        'click',
                        true, // bubble
                        true, // cancelable
                        window,
                        null,
                        0, 0, 0, 0, // coordinates
                        false, false, false, false, // modifier keys
                        0, // left
                        null
                    );
                    el.dispatchEvent(ce);

                    return true;
                }, selector);
            } catch (error) {
                console.log(error);
                response = false;
            }

            if (response === true) {
                console.log('Succeeded');

                if (successCallback) {
                    successCallback();
                }

                return;
            } else {
                console.log('Failed attempt: ' + response);
            }

            setTimeout(click.bind(this, selector, successCallback, failureCallback, delay, trials - 1), delay);
        },

        /**
         * Types the given string into a DOM element
         * 
         * @param {string}   str               The string to be typed
         * @param {string}   selector          Selector of the element into which the text should be typed
         * @param {boolean}  submit            Wether the "enter" key should be pressed after typing the string
         * @param {Function} [successCallback] Callback executed in case of success
         * @param {Function} [failureCallback] Callback executed in case of failure
         * @param {number}   [delay]           The delay, in milliseconds, before a new trial
         * @param {number}   [trials]          The number of allowed trials before failing
         * 
         * @returns {undefined}
         */
        type: function type(str, selector, submit, successCallback, failureCallback, delay, trials) {
            console.log('Typing in ' + selector);
            if (delay === undefined) {
                delay = DEFAULT_DELAY;
            }

            if (trials === undefined) {
                trials = DEFAULT_NUMBER_OF_TRIALS;
            }

            if (trials <= 0) {
                console.log('Failed');

                if (failureCallback) {
                    failureCallback();
                }

                return;
            }

            var response;
            try {
                response = page.evaluate(function (str, selector, submit) {
                    var el = document.querySelector(selector);
                    if (!el) {
                        return 'could not find element';
                    }

                    if (typeof el.value === 'string') {
                        el.value = str;
                        el.focus();
                    } else {
                        el.innerHTML = str;
                    }

                    if (submit === true) {
                        var eventNames = ['keydown', 'keypress'];
                        for (var i = 0; i < eventNames.length; i += 1) {
                            var event = document.createEvent('Events');
                            event.initEvent(eventNames[i], true, true);
                            event.keyCode = 13;
                            event.which = 13;
                            
                            el.dispatchEvent(event);
                        }
                    }

                    return true;
                }, str, selector, submit);
            } catch (error) {
                console.log(error);
                response = false;
            }

            if (response === true) {
                console.log('Succeeded');

                if (successCallback) {
                    successCallback();
                }

                return;
            } else {
                console.log('Failed attempt: ' + response);
            }

            setTimeout(type.bind(this, str, selector, submit, successCallback, failureCallback, delay, trials - 1), delay);
        }
    };
}