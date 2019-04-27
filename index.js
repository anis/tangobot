var config = require('./config');
var browserHelper = require('./helpers/browserHelper');

/**
 * 
 */
function waitForStyle(property, value, selector, successCallback, failureCallback, delay, trials) {
    console.log('Waiting for a text in ' + selector);
    if (delay === undefined) {
        delay = config.browser.delayBeforeRetry;
    }

    if (trials === undefined) {
        trials = config.browser.numberOfTrialsBeforeFailure;
    }

    if (trials <= 0) {
        console.log('Failed');
        failureCallback();
        return;
    }

    var response;
    try {
        response = page.evaluate(function (property, value, selector) {
            var el = document.querySelector(selector);
            if (!el) {
                return 'could not find element';
            }

            return el.style && el.style[property] === value;
        }, property, value, selector);
    } catch (error) {
        console.log(error);
        response = false;
    }

    if (response === true) {
        console.log('Succeeded');
        successCallback();
        return;
    } else {
        console.log('Failed attempt: ' + response);
    }

    setTimeout(waitForStyle.bind(this, property, value, selector, successCallback, failureCallback, delay, trials - 1), delay);
}


function login(name, password, callback) {
    setTimeout(function () {
        login__showForm(name, password, callback);
    }, 5000);
}

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
        waitForStyle(
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

function getAGiphy(imgType, search, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.giphy.com/v1/' + imgType + 's/random?api_key=yW6kdESjPKWJZUk09MtEMz4iBdPMY4eK&tag=' + encodeURIComponent(search) + '&rating=R', true);
    xhr.onload = function () {
        try {
            var response = JSON.parse(this.response);
            if (response.data && response.data.images && response.data.images.original) {
                callback(response.data.images.original.url);
            } else {
                callback(null);
            }
        } catch(error) {
            callback(null);
        }
    };
    xhr.onerror = function () {
        callback(null);
    };
    xhr.ontimeout = function () {
        callback(null);
    };
    xhr.onabort = function () {
        callback(null);
    };
    xhr.send();
}

function findRequests() {
    return page.evaluate(function () {
        var elements = document.querySelectorAll(
            '#OM > .msg > .msg-fg:not(.clear)'
        );

        var i = 0;
        var requests = {};
        for (var i = 0; i < elements.length; i += 1) {
            elements[i].classList.add('clear');
            var msgs = elements[i].querySelectorAll(
                '.user-thumb ~ div:last-of-type > p',
                '.user-thumb ~ div:last-of-type > p > span:nth-child(2)'
            );

            for (var j = 0; j < msgs.length; j += 1) {
                var result = msgs[j].textContent.match(/^(.+): \/(gif|sticker) ([a-zA-Z ]+)$/i);
                if (result !== null) {
                    requests[result[1]] = {
                        type: result[2],
                        content: result[3]
                    };
                    break;
                }
            }
        }

        return requests;
    });
}

var sorryMessages = [
    ['désolé', 'hmmm', 'arf', 'non', 'nope'],
    [', ', ' '],
    ['pas d\'image pour ça', 'y a rien qui colle', 'j\'ai rien trouvé', 'rien pour cette recherche'],
    ['...', ' :/', ' :(', ' ^^"']
];
function buildASorryMessage() {
    var msg = [];
    for (var i = 0; i < sorryMessages.length; i += 1) {
        msg.push(
            sorryMessages[i][Math.round(Math.random() * (sorryMessages[i].length - 1))]
        );
    }

    return msg.join('');
}

function sendAGiphy(imgType, user, search) {
    getAGiphy(imgType, search, function (imgSrc) {
        if (imgSrc === null) {
            browserHelper.type(
                '@' + user + ' ' + buildASorryMessage(),
                '#input-field',
                true,
                function () {},
                function () {}
            );
        } else {
            browserHelper.type(
                '@' + user + ' ' + imgSrc,
                '#input-field',
                true,
                function () {},
                function () {}
            );
        }
    });
}

var requesters = {
    gif: function (user, search) {
        return sendAGiphy('gif', user, search);
    },
    sticker: function (user, search) {
        return sendAGiphy('sticker', user, search);
    }
};
var lastRequests = {};

function respondToRequests() {
    var requests = findRequests();
    var now = Date.now();
    for (var user in requests) {
        if (requests.hasOwnProperty(user)) {
            if (!lastRequests[user] || (now - lastRequests[user]) >= config.bot.minimumDelayBetweenRequests) {
                requesters[requests[user].type](user, requests[user].content);
                lastRequests[user] = now;
            }
        }
    }

    window.requestAnimationFrame(respondToRequests);
}

var page = require('webpage').create();
page.open('https://eloriginale.chatango.com', function (status) {
    if (status !== 'success') {
        phantom.exit();
        return;
    }

    browserHelper.waitForElement(
        '#group_table',
        function () {
            page.switchToFrame(1);

            login(config.bot.credentials.username, config.bot.credentials.password, function (success) {
                if (success === true) {
                    findRequests(); // clear initial requests
                    window.requestAnimationFrame(respondToRequests);
                } else {
                    phantom.exit();
                }
            });
        },
        function () {
            phantom.exit();
        }
    );
});
