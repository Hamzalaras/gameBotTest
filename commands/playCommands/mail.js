const {  } = require('discord.js');
const { ErrorUnit } = require('../../centralUnits/errorUnit.js');
const { count } = require('../../centralUnits/usefullFuncs.js');
const {  Management } = require('../../dataBase.js');

module.exports ={
    name: ['بريدي', 'البريد'],
    path: { 'playCommands': [1, 7]},
    need: true,
    async execute(msg){
        try {
            const chestsTypes = count(Object.values(((await Management.selectManager(['chest_type'], 'players_mail_chests', ['player_id'], [msg.author.id]))[0])));
             
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`\`بريدي\`\`');
            return
        }
    }
}