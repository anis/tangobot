/**
 * @typedef {Object} Credentials
 * @property {string} username
 * @property {string} password
 */

module.exports = function (browserHelper) {
    var helper = {};

    /**
     * Opens a chatango group
     * 
     * @param {Webpage}  page            Any webpage
     * @param {string}   groupName       Name of the group to be opened
     * @param {Function} successCallback Callback executed in case of success
     * @param {Function} failureCallback Callback executed in case of failure
     * 
     * @returns {undefined}
     */
    helper.open = function open(page, groupName, successCallback, failureCallback) {
        console.log('Opening the group ' + groupName);
        page.open('https://' + groupName + '.chatango.com', function (status) {
            if (status !== 'success') {
                console.log('Failed');
                failureCallback();
                return;
            } else {
                console.log('Succeeded');
            }

            browserHelper.waitForElement(
                '#group_table',
                function () {
                    page.switchToFrame(1);
                    successCallback();
                },
                failureCallback
            );
        });
    };

    /**
     * @see chatangoHelper.login.js
     */
    helper.login = require('./chatangoHelper.login')(browserHelper);

    /**
     * Opens a chatango group and logs in to it
     * 
     * @param {Webpage}     page            Any webpage
     * @param {string}      groupName       Name of the group to be opened
     * @param {Credentials} credentials     Credentials for logging in
     * @param {Function}    successCallback Callback executed in case of success
     * @param {Function}    failureCallback Callback executed in case of failure
     * 
     * @returns {undefined}
     */
    helper.openAs = function openAs(page, groupName, credentials, successCallback, failureCallback) {
        helper.open(
            page,
            groupName,
            function () {
                setTimeout(function () {
                    helper.login.login(
                        credentials.username,
                        credentials.password,
                        successCallback,
                        failureCallback
                    );
                }, 5000); // timeout improves the chances of success (the iframe might take time to load)
            },
            failureCallback
        );
    };

    return helper;
};