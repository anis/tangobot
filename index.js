var config = require('./config');

function waitForElement(selector, callback, delay, trials) {
    console.log('Looking for ' + selector);
    if (delay === undefined) {
        delay = 500;
    }
    if (trials === undefined) {
        trials = 20;
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

var DEFAULT_DELAY = 500;
var DEFAULT_TRIALS = 20;
var REQUEST_DELAY = 10 * 1000;

/**
 * 
 */
function click(selector, successCallback, failureCallback, delay, trials) {
    console.log('Clicking on ' + selector);
    if (delay === undefined) {
        delay = DEFAULT_DELAY;
    }

    if (trials === undefined) {
        trials = DEFAULT_TRIALS;
    }

    if (trials <= 0) {
        console.log('Failed');
        failureCallback();
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
        successCallback();
        return;
    } else {
        console.log('Failed attempt: ' + response);
    }

    setTimeout(click.bind(this, selector, successCallback, failureCallback, delay, trials - 1), delay);
}

/**
 * 
 */
function type(str, selector, submit, successCallback, failureCallback, delay, trials) {
    console.log('Typing in ' + selector);
    if (delay === undefined) {
        delay = DEFAULT_DELAY;
    }

    if (trials === undefined) {
        trials = DEFAULT_TRIALS;
    }

    if (trials <= 0) {
        console.log('Failed');
        failureCallback();
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
        successCallback();
        return;
    } else {
        console.log('Failed attempt: ' + response);
    }

    setTimeout(type.bind(this, str, selector, submit, successCallback, failureCallback, delay, trials - 1), delay);
}

/**
 * 
 */
function waitForText(str, selector, successCallback, failureCallback, delay, trials) {
    console.log('Waiting for a text in ' + selector);
    if (delay === undefined) {
        delay = DEFAULT_DELAY;
    }

    if (trials === undefined) {
        trials = DEFAULT_TRIALS;
    }

    if (trials <= 0) {
        console.log('Failed');
        failureCallback();
        return;
    }

    var response;
    try {
        response = page.evaluate(function (str, selector) {
            var el = document.querySelector(selector);
            if (!el) {
                return 'could not find element';
            }

            return el.textContent.indexOf(str) >= 0;
        }, str, selector);
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

    setTimeout(waitForText.bind(this, str, selector, successCallback, failureCallback, delay, trials - 1), delay);
}

/**
 * 
 */
function waitForStyle(property, value, selector, successCallback, failureCallback, delay, trials) {
    console.log('Waiting for a text in ' + selector);
    if (delay === undefined) {
        delay = DEFAULT_DELAY;
    }

    if (trials === undefined) {
        trials = DEFAULT_TRIALS;
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
        click(
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
        type(
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
        type(
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

var oderIsAccepted = 0;
function sendAGiphy(imgType, user, search) {
    if (user === 'oderuntrubaiyat') {
        if (search.split(' ').slice(-2).join(' ') !== 'svp mme annick') {
            if (search.split(' ').slice(-1)[0] !== 'svp') {
                type(
                    '@' + user + ' ça te dérangerait de dire "svp" ? ...',
                    '#input-field',
                    true,
                    function () {},
                    function () {}
                );
                return;
            }

            type(
                '@' + user + ' d\'ailleurs, pour toi, c\'est "svp mme annick"',
                '#input-field',
                true,
                function () {},
                function () {}
            );

            type(
                'un peu de respect, tout de même',
                '#input-field',
                true,
                function () {},
                function () {}
            );

            return;
        }

        if (oderIsAccepted === 0) {
            type(
                '@' + user + ' en vrai ça m\'a tué ton manque de respect, gratte toi pour ton ' + imgType,
                '#input-field',
                true,
                function () {},
                function () {}
            );
            oderIsAccepted = 1;
            return;
        }

        if (oderIsAccepted === 1) {
            type(
                '@' + user + ' allez, c\'est bon, calme toi, le voilà ton ' + imgType + '...',
                '#input-field',
                true,
                function () {},
                function () {}
            );
            oderIsAccepted = 2;
        }
    }

    getAGiphy(imgType, search, function (imgSrc) {
        if (imgSrc === null) {
            type(
                '@' + user + ' ' + buildASorryMessage(),
                '#input-field',
                true,
                function () {},
                function () {}
            );
        } else {
            type(
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
        sendAGiphy('gif', user, search);
    },
    sticker: function (user, search) {
        sendAGiphy('sticker', user, search);
    }
};
var lastRequests = {};

function respondToRequests() {
    var requests = findRequests();
    var now = Date.now();
    for (var user in requests) {
        if (requests.hasOwnProperty(user)) {
            if (!lastRequests[user] || (now - lastRequests[user]) >= REQUEST_DELAY) {
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

    waitForElement('#group_table', function () {
        page.switchToFrame(1);

        login(config.credentials.username, config.credentials.password, function (success) {
            if (success === true) {
                findRequests(); // clear initial requests
                window.requestAnimationFrame(respondToRequests);
            } else {
                phantom.exit();
            }
        });
    });
});
