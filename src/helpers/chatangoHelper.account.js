module.exports = function (config, page, helpers) {
    var channels = {
        default: 'rgb(255, 255, 255)',
        red: 'rgb(237, 28, 36)',
        blue: 'rgb(37, 170, 225)'
    };

    return {
        /**
         * Sets the channel for current user
         * 
         * @param {string}   channel           Either 'default', 'red', or 'blue'
         * @param {Function} [successCallback]
         * @param {Function} [failureCallback]
         */
        setChannel: function (channel, successCallback, failureCallback) {
            if (!channels[channel]) {
                failureCallback();
                return;
            }

            helpers.browser.click(
                '.media-upload-wrap ~ .icon.ipt-icon',
                function () {
                    helpers.browser.waitForElement(
                        '.channel-picker',
                        function () {
                            var absIndex = page.evaluate(function (color) {
                                var channels = document.querySelectorAll('.chan-btn');
                                for (var i = 0; i < channels.length; i += 1) {
                                    if (channels[i].firstElementChild.style.backgroundColor === color) {
                                        return i;
                                    }
                                }

                                return null;
                            }, channels[channel]);
        
                            if (absIndex === null) {
                                failureCallback();
                                return;
                            }
        
                            var rowIndex = Math.floor(absIndex / 2) + 1;
                            var relIndex = (absIndex % 2) + 1;
                            helpers.browser.click(
                                '.channel-picker-row:nth-child(' + rowIndex + ') .chan-btn:nth-child(' + relIndex + ')',
                                function () {
                                    helpers.browser.click('.sdlg-title-close', successCallback, failureCallback);
                                },
                                failureCallback
                            );
                        },
                        failureCallback
                    );
                },
                failureCallback
            );
        }
    };
};