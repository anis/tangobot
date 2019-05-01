var fs = require('fs');

module.exports = function (config, page, helpers) {
    function insert(list, userStats) {
        var i = 0;
        while (i < list.length && list[i].total >= userStats.total) {
            i += 1;
        }

        return list.slice(0,i).concat([ userStats ]).concat(list.slice(i));
    }

    function build(username, stats) {
        var total = 0;
        for (var hour in stats) {
            if (stats.hasOwnProperty(hour)) {
                total += stats[hour];
            }
        }

        return {
            user: username,
            total: total,
            details: stats
        };
    }

    return {
        push: function process(messages) {
            var stats = JSON.parse(fs.read(config.dataSrc + '/grat.stats.json')) || {};
            var ordered = [];
            for (var username in stats) {
                if (stats.hasOwnProperty(username)) {
                    ordered = insert(ordered, build(username, stats[username]));
                }
            }

            if (ordered.length === 0) {
                helpers.chatango.message.send('Il n\'y a pas encore de classement pour le moment...');
                return;
            }

            var leaderboard = " \n \n _____\n";
            var lines = [];
            for (var i = 0; i < ordered.length; i += 1) {
                lines.push((i + 1) + '. @' + ordered[i].user + ' avec ' + ordered[i].total + ' gratouille' + (ordered[i].total > 1 ? 's' : ''));
            }

            helpers.chatango.message.send(leaderboard + lines.join("\n"));
        }
    };
};