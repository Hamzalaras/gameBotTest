const {  } = require('discord.js');
const { ErrorUnit, FalseInput } = require('../../centralUnits/errorUnit.js');
const { Management } = require('../../dataBase.js');
const { chestGenerator } = require('../../centralUnits/usefullFuncs.js');

module.exports = {
    name: ['فتح_صندوق'],
    path: { 'playCommands': [1, 8]},
    need: true,
    async execute(msg, args){
        try {
            const chestName = args[1];
            if(!(['عام', 'نادر', 'واعر', 'هارب'].some(i => i === chestName))) throw new FalseInput('فتح_صندوق');

            const getChestInfo = await Management.selectManager(['chest_type', 'chest_num'], 'players_mail_chests', ['player_id', 'chest_type'], [33, chestName]);

            if(getChestInfo.length === 0){
                await ErrorUnit.throwError(false, msg, `ليس لديكم هذا النوع من الصناديق: ${chestName}`);
                return;
            };

            const chest = chestGenerator(`${chestName}`);
            const [cards, welth] = [chest.cards, chest.welth];

            const dispoCheck = [];
            for(const card of cards){
                const row = await Management.selectManager(['card_id', 'uses_left'], 'players_cards', ['player_id', 'card_id'], [5, card.id]);
                dispoCheck.push(row);
            }
            console.log(dispoCheck);

            for(let i = 0; i < dispoCheck.length; i++){
                dispoCheck[i].length === 0 ?
                    await Management.insertManager(
                        ['player_name', 'player_id', 'card_id', 'uses_left'],
                        'players_cards',
                        [msg.author.globalName, 5, cards[i].id, cards[i].usesLeft]
                    ) :
                    await Management.updateManager(
                        ['uses_left'], 
                        'players_cards', 
                        [Number(dispoCheck[i][0].uses_left) + cards[i].usesLeft],
                        ['player_id', 'card_id'], [5, dispoCheck[i][0].card_id]
                    ) ;
            }

/*
            const num = Number(getChestInfo[0].chest_num);
            num > 1 ? Management.updateManager(['chest_num'], 'players_mail_chest', [`${num - 1}`], ['player_id', 'chest_type'], [msg.author.id, chestName]) :
                      Management.deleteManager('players_mail_chest', ['player_id', 'chest_type'], [msg.author.id, chestName]);
*/
             return;
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`\`فتح_صندوق\`\`');
            return;
        }
    }
}