module.exports = function (browserHelper) {
    return {
        login: require('./chatangoHelper.login')(browserHelper)
    };
};