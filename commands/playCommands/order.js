const { EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const { ErrorUnit, RandomErrors } = require('../../centralUnits/errorUnit.js');
const path = require('path');

module.exports = {
    name: ['أوامر', 'اوامر', 'الأوامر', 'الاوامر'],
    path: { 'playCommands': [2, 0] },
    async execute(msg){
        try {

            //Embed and shit
            const avatar = msg.client.user.displayAvatarURL({ dynamic: true, size: 1024 });
            const faceEmbed = new EmbedBuilder()
                                .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${avatar}`})
                                .setColor('Red')
                                .setTitle('🌌بوت الرحمة الكونية🌌')
                                .setDescription(`\*\*يا من يبتغي رحمة كونية ~~\*\*\n\nبوت الرحمة الكونية يوفر لك رحلة شيقة لصناعة المجد. في عالم لم يبقى فيه سوى شهوة طاهرة؛ اصبحت الرحمة الكونية صعبة التحصيل؛ كثرت البطاقات السحرية و وجوه النم؛ اجمع ما استطعت و إعتزل طريقا لك و اصنع لنفسك اسما يتغنى به كل مشته طموح.`)
                                .addFields(
                                    {name: `هام:`, value: `\*\*~يرجى قراءة قوانين البوت قبل البدأ باللعب~\*\*`}
                                )
            const commandSelectMenu = new StringSelectMenuBuilder()
                                        .setPlaceholder('إختر إحدى الإختيارات لعرض أوامرها')
                                        .setCustomId('commandSelectMenu')
                                        .addOptions(
                                            new StringSelectMenuOptionBuilder()
                                                .setLabel('أوامر اللعب')
                                                .setValue('playCommands')
                                                .setDescription('إضغط علي لعرض أوامر اللعب'),
                                            new StringSelectMenuOptionBuilder()
                                                .setLabel('أوامر الأدمن')
                                                .setValue('adminCommands')
                                                .setDescription('إضغط علي لعرض أوامر الأدمن'),
                                            new StringSelectMenuOptionBuilder()
                                                .setLabel('أوامر صناع البوت')
                                                .setValue('ownersCommands')
                                                .setDescription('إضغط علي لعرض أوامر صناع البوت')
                                        );           
            const commandSelectMenuRow = new ActionRowBuilder().addComponents(commandSelectMenu);

            const commandSelectMenuResponse = await msg.channel.send({content: `${msg.author}`, embeds:[faceEmbed], components: [commandSelectMenuRow]});
            const filter = i => i.user.id === msg.author.id ;
            const responseCollector = commandSelectMenuResponse.createMessageComponentCollector({ componentType: ComponentType.StringSelect, filter, time: 300_000});
            
            responseCollector.on('collect', async interaction =>{
                try {
                    await interaction.deferUpdate();

                    //Get the right help.json file
                    const jsonFilePath = path.join(__dirname, '..', interaction.values[0], 'help.json');
                    const file = require(jsonFilePath); 
                    const commands = file.commands;

                    //Get the commands
                    let content = '';
                    commands.forEach(command => {
                        content += `\n‼️\*\*${command.for}\*\*\n`;
                        command.data.forEach(obj => content += `\`${obj.commandName}\` --`);
                    });

                    //Embed and shit 
                    const commandEmbed = new EmbedBuilder()
                                            .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${avatar}`})
                                            .setColor('Red')
                                            .setTitle(`${file.arabicName}`)
                                            .setDescription(`${content}`);

                    await commandSelectMenuResponse.edit({content: `${msg.author}`, embeds:[commandEmbed], components: [commandSelectMenuRow]});
                    return
                } catch (error) {
                    throw error;
                }
            });

            responseCollector.on('end', async interaction => {
                try {
                    commandSelectMenu.setDisabled(true);
                    await commandSelectMenuResponse.edit({content: `${msg.author}\nإنتهى الوقت المخصص لهذه العملية يرجى المحاولة مرة أخرى 😘`, components: [commandSelectMenuRow]});
                    return;
                } catch (error) {
                    throw error;
                }
            });
        }catch(error){
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر: \`أوامر\` 🥲');
            return;
        }
    }
}