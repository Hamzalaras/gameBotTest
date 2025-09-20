const { EmbedBuilder } = require('discord.js');
const { ErrorUnit } = require('../../centralUnits/errorUnit.js');
const { count } = require('../../centralUnits/usefullFuncs.js');
const {  Management } = require('../../dataBase.js');

module.exports ={
    name: ['بريدي', 'البريد', 'بريد'],
    path: { 'playCommands': [1, 7]},
    need: true,
    async execute(msg){
        try {
            const getChests = await Management.selectManager(['chest_type'], 'players_mail_chests', ['player_id'], [33]);
            if(getChests.length === 0){
                await ErrorUnit.throwError(false, msg, 'بريدكم فارغ حاليا!!');
                return;
            }
            const chestsTypes = count(Object.values(getChests[0]));
            
            const content = [];
            for(const [type, num] of Object.entries(chestsTypes)){
                content.push(
                    { name: `الصناديق من النوع ال${type}:`,
                        value: `--لديكم \*\*${num}\*\* صناديق ${type}`
                    }
                );
            };
            const mailEmbed = new EmbedBuilder()
                                  .setTitle(`بريد اللاعب ${msg.author}`)
                                  .addFields(content);

            await msg.channel.send({content: `${msg.author}`, embeds: [mailEmbed]});
            return;                      
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`\`بريدي\`\`');
            return
        }
    }
}