const { EmbedBuilder } = require('discord.js');
const { ErrorUnit, RandomErrors } = require('../../centralUnits/errorUnit.js');
const {  Management } = require('../../dataBase.js');

module.exports ={
    name: ['بريدي', 'البريد', 'بريد'],
    path: { 'playCommands': [1, 7]},
    need: true,
    async execute(msg){
        try {
            //Get the msg.author mail chests
            const getChests = await Management.selectManager(['chest_type', 'chest_num'], 'players_mail_chests', ['player_id'], [msg.author.id]);
            if(getChests.length === 0) throw new RandomErrors('بريدكم فارغ حاليا!! 😘');

            //Each element of chestsTypes will be an array, the array contient 2 items,
            // index 0 is the name of chest, index 1 is the number of chests of that type
            const chestsTypes = getChests.map(obj => [Object.values(obj)[0], Object.values(obj)[1]]);

            //Embed and shit 
            const avatar = msg.client.user.displayAvatarURL({ dynamic: true, size: 1024 });
            const mailEmbed = new EmbedBuilder()
                                  .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${avatar}`})
                                  .setColor('Green')
                                  .setTitle(`🕹️بريد اللاعب ${msg.author}`)
                                  .addFields(
                                    chestsTypes.map(type => { 
                                        return {
                                            name: `🎁الصناديق من النوع ال${type[0]}:`,
                                              value: `--لديكم \*\*${type[1]}\*\* صناديق ${type[0]}`
                                        };
                                    })
                                  );

            await msg.channel.send({content: `${msg.author}`, embeds: [mailEmbed]});
            return;                      
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`\`بريدي\`\` 🥲');
            return
        }
    }
}