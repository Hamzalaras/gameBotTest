const { EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder, ComponentType } = require('discord.js');
const { CollectorError, ErrorUnit } = require('../../centralUnits/errorUnit.js');
const path = require('path');

module.exports = {
    name: ['أوامر', 'اوامر', 'الأوامر', 'الاوامر'],
    path: { 'playCommands': [2, 0] },
    async execute(msg){
        try {

            const serverAvatar = await msg.guild.iconURL({ dynamic: true, size: 2048});
            const faceEmbed = new EmbedBuilder()
                                .setThumbnail(serverAvatar)
                                .setColor('Red')
                                .setTitle('بوت الرحمة الكونية')
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
            const filter = i => { return i.user.id === msg.author.id };
            const responseCollector = commandSelectMenuResponse.createMessageComponentCollector({ componentType: ComponentType.StringSelect, filter, time: 300_000});
            
            responseCollector.on('collect',async interaction =>{
                try {
                    await interaction.deferUpdate();

                    const jsonFilePath = path.join(__dirname, '..', interaction.values[0], '.json');
                    const file = require(jsonFilePath); 
                    const commands = file.commands;

                    let content = '';
                    commands.forEach(command => {
                        content = content + `\n \*\*${command.for}\*\* \n`;
                        command.data.forEach(obj => content = content + `\`${obj.commandName}\` --`);
                    });

                    const commandEmbed = new EmbedBuilder()
                                            .setThumbnail(serverAvatar)
                                            .setColor('Red')
                                            .setTitle(`${file.arabicName}`)
                                            .setDescription(`${content}`);

                    await commandSelectMenuResponse.edit({content: `${msg.author}`, embeds:[commandEmbed], components: [commandSelectMenuRow]});
                    return
                } catch (error) {
                    throw new CollectorError(error.message);
                }
            });

            responseCollector.on('end', async interaction => {
                try {
                    commandSelectMenu.setDisabled(true);
                    await commandSelectMenuResponse.edit({content: `${msg.author}\n إنتهى الوقت المخصص لهذه العملية يرجى المحاولة مرة اخرى😘`, components: [commandSelectMenuRow]});
                    return;
                } catch (error) {
                    throw new CollectorError(error.message);
                }
            });
        }catch(error){
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر: \`أوامر\`');
            return;
        }
    }
}