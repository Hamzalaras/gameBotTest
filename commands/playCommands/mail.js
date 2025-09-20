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
            const getChests = await Management.selectManager(['chest_type', 'chest_num'], 'players_mail_chests', ['player_id'], [33]);
            if(getChests.length === 0){
                await ErrorUnit.throwError(false, msg, 'بريدكم فارغ حاليا!!');
                return;
            }

            const chestsTypes = getChests.map(obj => [Object.values(obj)[0], Object.values(obj)[1]] );

            const mailEmbed = new EmbedBuilder()
                                  .setTitle(`بريد اللاعب ${msg.author}`)
                                  .addFields(
                                    chestsTypes.map(type => { 
                                        return {
                                            name: `الصناديق من النوع ال${type[0]}:`,
                                              value: `--لديكم \*\*${type[1]}\*\* صناديق ${type[0]}`
                                        }
                                    })
                                  );

            await msg.channel.send({content: `${msg.author}`, embeds: [mailEmbed]});
            return;                      
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`\`بريدي\`\`');
            return
        }
    }
}