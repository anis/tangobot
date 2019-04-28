module.exports = function () {
    var sorryMessages = [
        ['désolé', 'hmmm', 'arf', 'non', 'nope'],
        [', ', ' '],
        ['pas d\'image pour ça', 'y a rien qui colle', 'j\'ai rien trouvé', 'rien pour cette recherche'],
        ['...', ' :/', ' :(', ' ^^"']
    ];

    return {
        buildASorryMessage: function buildASorryMessage() {
            var msg = [];
            for (var i = 0; i < sorryMessages.length; i += 1) {
                msg.push(
                    sorryMessages[i][Math.round(Math.random() * (sorryMessages[i].length - 1))]
                );
            }
        
            return msg.join('');
        }
    };
};