const { EmbedBuilder } = require('discord.js');
const { ErrorUnit, RandomErrors } = require('../../centralUnits/errorUnit.js');
const { Management } = require('../../dataBase.js');

module.exports ={
    name: ['بريدي', 'البريد', 'بريد'],
    category: 'player',
    need: true,
    async execute(msg){
        try {
            //Get the msg.author mail chests
            const userChests = await Management.selectManager(
                                            ['chest_type', 'chest_num'],
                                            'players_mail_chests',
                                            ['player_id'],
                                            [msg.author.id]
                                        );

            if (!userChests.length) {
                throw new RandomErrors('بريدكم فارغ حاليا!! 😘');
            }

            //Embed and shit 
            const fields = userChests.map(type => {
                                return {
                                    name: `🎁الصناديق من النوع ال${type['chest_type']}:`,
                                    value: `--لديكم \*\*${type['chest_num']}\*\*\
                                    صناديق ${type['chest_type']}`
                                }
                            }
                        );

            const botAvatar = msg.client.user.displayAvatarURL({ dynamic: true, size: 1024 });
            const mainEmbed = new EmbedBuilder()
                                  .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${botAvatar}`})
                                  .setColor('Green')
                                  .setTitle(`🕹️بريد اللاعب ${msg.author}`)
                                  .addFields(fields);

            await msg.channel.send({content: `${msg.author}`, embeds: [mainEmbed]});

            return;                      
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`\`بريدي\`\` 🥲');
            return
        }
    }
}