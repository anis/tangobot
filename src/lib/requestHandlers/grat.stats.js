var fs = require('fs');

module.exports = function (config, page, helpers) {
    function insert(list, userStats) {
        var i = 0;
        while (i < list.length && list[i].total > userStats.total) {
            i += 1;
        }

        if (i >= list.length) {
            return list.push([ userStats ]);
        }

        if (list[i][0].total === userStats.total) {
            returnlist[i].push(userStats);
        }

        return list.slice(0,i).concat([[userStats]]).concat(list.slice(i));
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
            var leaderboardWasAsked = false;
            for (var i = 0; i < messages.length; i += 1) {
                if (messages[i].request !== null && messages[i].request.type === 'grat.stats') {
                    leaderboardWasAsked = true;
                    break;
                }
            }

            if (!leaderboardWasAsked) {
                return;
            }

            var stats = JSON.parse(fs.read(config.dataSrc + '/grat.stats.json')) || {};
            var ordered = [];
            for (var username in stats) {
                if (stats.hasOwnProperty(username)) {
                    ordered = insert(ordered, build(username, stats[username]));
                }
            }

            if (ordered.length === 0) {
                helpers.chatango.message.send('Il n\'y a pas de classement pour le moment...');
                return;
            }

            var leaderboard = " \n \n _____\n";
            var lines = [];
            for (var i = 0; i < ordered.length; i += 1) {
                lines.push((i + 1) + '. ' + ordered[i].map(({ user }) => user).join(', ') + ' avec ' + ordered[i][0].total + ' gratouille' + (ordered[i][0].total > 1 ? 's' : ''));
            }

            helpers.chatango.message.send(leaderboard + lines.join("\n"));
        }
    };
};