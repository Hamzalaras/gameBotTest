const { EmbedBuilder } = require('discord.js');
const { ErrorUnit, FalseInput, RandomErrors } = require('../../centralUnits/errorUnit.js');
const helpJSON = require('../../data/help.json');

module.exports = {
    name: ['مساعدة', 'مساعده'],
    category: 'player',
    async execute(msg, args){
        try {
            //Check the valid input
            const commandToSearch = args[1];
            if (!commandToSearch) {
                throw new FalseInput('مساعدة');
            }

            //Get the target Command
            let [commandName, alias, category] = [null, null];
            for (const [key, data] of msg.client.commands) {
                if ('name' in data && data.name.includes(commandToSearch) ) {
                    [commandName, alias, category] = [key, data.name, data.category];
                    break;
                }
                if ( key === commandToSearch ) {
                    [commandName, alias, category] = [key, ['لا يوجد'], data.category];
                    break;
                }
            }
            if (!commandName) {
                throw new RandomErrors(`لم يتم العثور على الأمر: \`${commandToSearch}\``);
            }



            //Get the help paragraphe
            const categoryObj = helpJSON.find(c => c.category === category);
            const commandList = categoryObj?.commands.map(type => type.data).flat();
            const description = commandList.find(c => c.commandName === commandName)?.help;
            if (!description) {
                throw new RandomErrors(`لم يتم ايجاد شرح الأمر: \`${commandToSearch}\``);
            }

            //Embed and shit 
            const botAvatar = msg.client.user.displayAvatarURL({ dynamic: true, size: 1024, });
            const mainEmbed = new EmbedBuilder()
                                .setTitle(`شرح الأمر: \*\*${commandName}\*\*`)
                                .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${botAvatar}`, })
                                .setColor('Green')
                                .addFields(
                                    { name: 'الشرح:', value: `\*\*${description}\*\*\n`, },
                                    { name: 'أسماء أخرى لنفس الأمر:', value: `\`${alias.join('\` \`')}\``, }
                                );

            await msg.channel.send({ content: `${msg.author}`, embeds: [mainEmbed], });

            return;
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`مساعدة \` 🥲');
            return;
        }                      
    }
}