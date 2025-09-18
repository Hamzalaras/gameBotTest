const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder, ComponentType, ButtonBuilder, ButtonStyle, time } = require('discord.js');
const characters = require('../../data/character/character.json');
const { CollectorError, ErrorUnit } = require('../../centralUnits/errorUnit.js');
const { Management } = require('../../dataBase.js');

module.exports = {
    name: ["رحمة", "الرحمة", "رحمه", "الرحمه"],
    path: { 'playCommands': [0, 0]},
    need: false,
    async execute(msg){
        try {
            const serverAvatar = await msg.guild.iconURL({ dynamic: true, size: 2048});
            const rahmaEmbed = new EmbedBuilder()
                                .setTitle('بوت لعبة الرحمة الكونية')
                                .setDescription(`\*\*--مرحبا بك يا من يبتغي الرحمة الكونية🌌: "${msg.author.username}". \n --استعد لأغرب تجربة تمر عليك؛ فالرحمة ليست مرحلة بل هي أسلوب حياة و عيش!!✨ \n --اختر أحد الشخصيات اسفله لتمثلك في باقي مغامرتك🎭\*\*`)
                                .addFields(
                                    {name: `هام:`, value: `\*\*~يرجى قراءة قوانين البوت قبل البدأ باللعب~\*\*`}
                                )
                                .setThumbnail(serverAvatar);
            const characterSelect = new StringSelectMenuBuilder()
                                        .setCustomId('charecterSelect')
                                        .setPlaceholder('🎭 من فضلك اختر احدى الشخصيات لعرض معلوماتها')
                                        .addOptions(
                                            new StringSelectMenuOptionBuilder()
                                                .setLabel('حلاق الرحمة')
                                                .setDescription('اضغط علي لعرض معلومات الشخصية')
                                                .setValue('حلاق الرحمة'),
                                            new StringSelectMenuOptionBuilder()
                                                .setLabel('عباس دي واترسون')
                                                .setDescription('اضغط علي لعرض معلومات الشخصية')
                                                .setValue('عباس دي واترسون'),
                                            new StringSelectMenuOptionBuilder()
                                                .setLabel('بابيشة')
                                                .setDescription('اضغط علي لعرض معلومات الشخصية')
                                                .setValue('بابيشة'),
                                            new StringSelectMenuOptionBuilder()
                                                .setLabel('كمال كنجوة')
                                                .setDescription('اضغط علي لعرض معلومات الشخصية')
                                                .setValue('كمال كنجوة'),
                                        );

            const btns = [
                new ButtonBuilder().setCustomId('chosen').setLabel('إختيار').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('rules').setLabel('القوانين').setStyle(ButtonStyle.Danger)
            ];

            const btnRow = new ActionRowBuilder().addComponents(btns);
            const characterSelectRow = new ActionRowBuilder().addComponents(characterSelect);
            const filter = i => i.user.id === msg.author.id ;

            const rahmaResponse = await msg.channel.send({content: `${msg.author}`, embeds: [rahmaEmbed], components: [characterSelectRow], filter});
            const collector = rahmaResponse.createMessageComponentCollector({ componentType: ComponentType.StringSelect, filter, time: 300_000});

            collector.on('collect', async interaction =>{
                try {
                    interaction.deferUpdate();
                    const targetCharacter = characters.find(character => character.name === interaction.values[0]);  
                    if(!targetCharacter){ 
                        await ErrorUnit.throwError(false, msg, `يبدو أن هذه الشخصية قد تم حذفها دون تحديث البايانات! 🥲\n نعتذر على الخطأ الفادح سيتم اصلاح المشكل بأقرب وقت ❤️`);
                        return;
                    }

                    let targetCharacterCards = '';
                    targetCharacter.characterCards.forEach(card => targetCharacterCards = targetCharacterCards + `- بطاقة: \*\*~~${card.name}~~\*\* لها: \*\*${card.stages.length}\*\* مستويات.\n`);
                    const charecterEmbed = new EmbedBuilder()
                                            .setTitle(`${targetCharacter.name}`)
                                            .setDescription(`${targetCharacter.description}`)
                                            .addFields(
                                                { name: `\*\*معلومات الشخصية الأساسية:\*\*`, value:`-لون البشرة: ${targetCharacter.skin}\n -مستوى الشهوة: ${targetCharacter.initialShahwaLevel}\n -نقاط الهجوم: ${targetCharacter.initialAttack}\n -نقاط الدفاع: ${targetCharacter.initialDefense}\n -نقاط السحر: ${ targetCharacter.initialMagic}\n -نقاط الجسم: ${targetCharacter.initialPhysic}`},
                                                { name: `البطاقات الخاصة بالشخصية:`, value: `${targetCharacterCards}` }
                                            )

                    const edited = await rahmaResponse.edit({ embeds: [charecterEmbed], components: [btnRow, characterSelectRow]});                         
                    const editedConfirmation = await edited.awaitMessageComponent({time: 60_000, filter});

                    if(editedConfirmation.customId === 'chosen'){
                        await editedConfirmation.deferUpdate();
                        await Management.insertManager(
                            ['player_name', 'discord_id', 'character_selected', 'story_position'],
                            'players',
                            msg.author.globalName, msg.author.id, targetCharacter.name, targetCharacter.initialShahwaLevel
                        );
                        await rahmaResponse.edit({content: 'لقد تمت اضافتك كلاعب بنجاح!! 😘\n يرجى طباعة الأمر: \`أوامر\` لعرض أوامر البوت 🥰', embeds:[], components: []});
                        return;
                    }else if(editedConfirmation.customId === 'rules'){
                        await editedConfirmation.deferUpdate();
                        return;
                    }
                } catch (error) {
                    throw new CollectorError(error.message);
                }
            });
            
            collector.on('end', async ()=>{
                try {
                    btns.forEach(b => b.setDisabled(true));
                    characterSelect.setDisabled(true);
                    await rahmaResponse.edit({content: `${msg.author}\nلقد إنتهى الوقت المحدد لهذه العملية!! 🥲`});
                    return;
                } catch (error) {
                    throw new CollectorError(error.message);
                }
            });
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`رحمة\`');
            return;
        }
    }
}