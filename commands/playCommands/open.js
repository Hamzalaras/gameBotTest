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

            const getChestInfo = Management.selectManager(['chest_type', 'chest_num'], 'player_mail_chest', ['player_id', 'chest_type'], [msg.author.id, chestName]);
            if(getChestInfo.length === 0){
                await ErrorUnit.throwError(false, msg, `ليس لديكم هذا النوع من الصناديق: ${chestName}`);
                return;
            };

            const chest = chestGenerator(`${chestName}`);

            const num = Number(getChestInfo[0].chest_num);
            num > 1 ? Management.updateManager(['chest_num'], 'players_mail_chest', [`${num - 1}`], ['player_id', 'chest_type'], [msg.author.id, chestName]) :
                      Management.deleteManager('players_mail_chest', ['player_id', 'chest_type'], [msg.author.id, chestName]);

             
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`\`فتح_صندوق\`\`');
            return;
        }
    }
}