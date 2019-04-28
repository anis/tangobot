module.exports = function (config, page, helpers) {
    function login__showForm(name, password, successCallback, failureCallback) {
        setTimeout(function () {
            helpers.browser.click(
                '#LOGIN > div',
                function () {
                    login__typeName(name, password, successCallback, failureCallback);
                },
                failureCallback
            );
        }, 1000);
    }

    function login__typeName(name, password, successCallback, failureCallback) {
        setTimeout(function () {
            helpers.browser.type(
                name,
                '#full-username-input',
                false,
                function () {
                    login__typePassword(password, successCallback, failureCallback);
                },
                failureCallback
            );
        }, 1000);
    }

    function login__typePassword(password, successCallback, failureCallback) {
        setTimeout(function () {
            helpers.browser.type(
                password,
                '#full-password-input',
                true,
                function () {
                    login__waitForResult(successCallback, failureCallback);
                },
                failureCallback
            );
        }, 1000);
    }

    function login__waitForResult(successCallback, failureCallback) {
        setTimeout(function () {
            helpers.browser.waitForStyle(
                'display',
                'none',
                '#LOGIN',
                function () {
                    login__setChannel(successCallback);
                },
                failureCallback
            );
        }, 1000);
    }

    function login__setChannel(successCallback) {
        setTimeout(function () {
            helpers.chatango.account.setChannel('red', successCallback, successCallback);
        }, 1000);
    }

    return {
        login: function login(name, password, successCallback, failureCallback) {
            login__showForm(name, password, successCallback, failureCallback);
        }
    };
};