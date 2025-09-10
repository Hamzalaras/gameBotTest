const { EmbedBuilder } = require('discord.js');
const { ErrorUnit } = require('../../centralUnits/errorUnit.js');
const path = require('path');

module.exports = {
    name: ['مساعدة', 'مساعده'],
    path: { 'playCommands': [2, 1] },
    async execute(msg, args){
        try {
            const targetCommand = commandsNames.map(name => msg.client.commands.get(name))
                                    .find(command => command.name && command.name.includes(args[1]));
            if(!targetCommand){
                await ErrorUnit.throwError(false, msg, `لم يتم العثور على الأمر: \`${args[1]}`);
                return;
            }

            const pathToCommand = targetCommand.path;
            const folderName = Object.keys(pathToCommand)[0];
            const values = Object.values[0]; 
            const jsonPath = path.join(__dirname, '..', folderName, '.json');
            const commands = require(jsonPath);

            const help = commands.commands[values[0]].data[values[1]].help;
            if(!help){
                await ErrorUnit(false, msg, `لم يتم ايجاد شرح الأمر: \`${args[1]}\``);
                return;
            }

            const serverAvatar = await msg.guild.iconURL({ dynamic: true, size: 2048});
            const faceEmbed = new EmbedBuilder()
                                .setTitle(`شرح الأمر: ${targetCommand.name[0]}`)
                                .setThumbnail(serverAvatar)
                                .setColor('Green')
                                .addFields(
                                    { name: 'الشرح:', value: `\*\*${help}\*\*\n`},
                                    { name: 'أسماء أخرى لنفس الأمر:', value: `${targetCommand.name.map(name => `\`${name}\``)}`}
                                );

            await msg.channel.send({content: `${msg.author}`, embeds: [faceEmbed]});
            return;
        } catch (error) {
            await ErrorUnit(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`مساعدة \`');
            return;
        }                      
    }
}