module.exports = function (browserHelper) {
    function login__showForm(name, password, callback) {
        setTimeout(function () {
            browserHelper.click(
                '#LOGIN > div',
                function () {
                    login__typeName(name, password, callback);
                },
                function () {
                    callback(false);
                }
            );
        }, 1000);
    }

    function login__typeName(name, password, callback) {
        setTimeout(function () {
            browserHelper.type(
                name,
                '#full-username-input',
                false,
                function () {
                    login__typePassword(password, callback);
                },
                function () {
                    callback(false);
                }
            );
        }, 1000);
    }

    function login__typePassword(password, callback) {
        setTimeout(function () {
            browserHelper.type(
                password,
                '#full-password-input',
                true,
                function () {
                    login__waitForResult(callback);
                },
                function () {
                    callback(false);
                }
            );
        }, 1000);
    }

    function login__waitForResult(callback) {
        setTimeout(function () {
            browserHelper.waitForStyle(
                'display',
                'none',
                '#LOGIN',
                function () {
                    callback(true)
                },
                function () {
                    callback(false);
                }
            );
        }, 1000);
    }

    return {
        login: function login(name, password, callback) {
            login__showForm(name, password, callback);
        }
    };
};