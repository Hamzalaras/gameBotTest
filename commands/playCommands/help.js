const { EmbedBuilder } = require('discord.js');
const { ErrorUnit, FalseInput, RandomErrors } = require('../../centralUnits/errorUnit.js');
const path = require('path');

module.exports = {
    name: ['مساعدة', 'مساعده'],
    path: { 'playCommands': [2, 1] },
    async execute(msg, args){
        try {
            //Check the valid input
            if(!args[1]) throw new FalseInput('مساعدة');

            //Get the target Command
            const commandsNames = [...msg.client.commands.keys()]; //List all the command names using spread 👅 operator
            const targetCommand = commandsNames.map(name => msg.client.commands.get(name)) //List all the commands one by one 
                                    .find(command => command.name && command.name.includes(args[1])); // search if an alias match the given keyWord -- !! FOR LARGE PROGRAMS I PREFER TO USE A FOR...OF LOOP WITH BREAK STATEMENT !!
            if(!targetCommand) throw new RandomErrors(`لم يتم العثور على الأمر: \`${args[1]}\``);

            //Get the right help.json file
            const pathToCommand = targetCommand.path;
            const folderName = Object.keys(pathToCommand)[0];
            const values = Object.values(pathToCommand)[0]; 
            const jsonPath = path.join(__dirname, '..', folderName, 'help.json');
            const commands = require(jsonPath);

            //Get the help paragraphe
            const help = commands.commands[values[0]].data[values[1]].help;
            if(!help) throw new RandomErrors(`لم يتم ايجاد شرح الأمر: \`${args[1]}\``);

            //Embed and shit 
            const avatar = msg.client.user.displayAvatarURL({ dynamic: true, size: 1024 });
            const faceEmbed = new EmbedBuilder()
                                .setTitle(`شرح الأمر: ${targetCommand.name[0]}`)
                                .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${avatar}`})
                                .setColor('Green')
                                .addFields(
                                    { name: 'الشرح:', value: `\*\*${help}\*\*\n`},
                                    { name: 'أسماء أخرى لنفس الأمر:', value: `${targetCommand.name.map(name => `\`${name}\``)}`}
                                );

            await msg.channel.send({content: `${msg.author}`, embeds: [faceEmbed]});
            return;
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`مساعدة \` 🥲');
            return;
        }                      
    }
}