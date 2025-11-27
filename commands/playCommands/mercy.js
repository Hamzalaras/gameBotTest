const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, StringSelectMenuOptionBuilder, ComponentType, ButtonBuilder, ButtonStyle, time } = require('discord.js');
const charactersJSON = require('../../data/character/character.json');
const { ErrorUnit, RandomErrors } = require('../../centralUnits/errorUnit.js');
const { Management } = require('../../dataBase.js');

module.exports = {
    name: ["رحمة", "الرحمة", "رحمه", "الرحمه"],
    category: 'player',
    need: false,
    async execute(msg){
        try {
            //Embed and shit 
            const botAvatar = msg.client.user.displayAvatarURL({ dynamic: true, size: 1024, });
            const mainEmbed = new EmbedBuilder()
                                .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${botAvatar}, `})
                                .setColor('Red')
                                .setTitle('🌌بوت لعبة الرحمة الكونية🌌')
                                .setDescription(`\*\*--مرحبا بك يا من يبتغي الرحمة الكونية🌌: "${msg.author.globalName}" .\n\
                                   --استعد لأغرب تجربة تمر عليك؛ فالرحمة ليست مرحلة بل هي أسلوب حياة و عيش!!✨ \n\
                                    --اختر أحد الشخصيات اسفله لتمثلك في باقي مغامرتك🎭\*\*`)
                                .addFields(
                                    {
                                        name: `🚨هام:`, 
                                        value: `\*\*يرجى قراءة قوانين البوت قبل البدأ باللعب\*\*`,
                                    },
                                )
                                .setThumbnail(botAvatar);
            const charactersOptionMenu = charactersJSON.map(character => {
                                                return new StringSelectMenuOptionBuilder()
                                                            .setLabel(`${character.name}`)
                                                            .setDescription('اضغط علي لعرض معلومات الشخصية')
                                                            .setValue(`${character.name}`)
                                                            }
                                                );           
            const characterSelectMenu = new StringSelectMenuBuilder()
                                            .setCustomId('charecterSelectMenu')
                                            .setPlaceholder('🎭من فضلك اختر احدى الشخصيات لعرض معلوماتها')
                                            .addOptions(charactersOptionMenu);
            const confirmeBtn = [
                new ButtonBuilder().setCustomId('chose').setLabel('إختيار').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('rules').setLabel('القوانين').setStyle(ButtonStyle.Danger),
            ];
            const [btnRow, characterSelectRow] = 
                [
                    new ActionRowBuilder().addComponents(confirmeBtn),
                    new ActionRowBuilder().addComponents(characterSelectMenu),
                ]

            const filter = i => i.user.id === msg.author.id ;
            const mainMsgObj = await msg.channel.send(
                    {
                        content: `${msg.author}`,
                        embeds: [mainEmbed],
                        components: [characterSelectRow],
                    }
                );
            const collectMenuInteraction = mainMsgObj.createMessageComponentCollector(
                        {
                            componentType: ComponentType.StringSelect,
                            filter, 
                            time: 300_000,
                        }
                    );

            collectMenuInteraction.on('collect', async interaction =>{
                try {
                    interaction.deferUpdate();
                    //Get the character selected
                    const chosenCharacter = charactersJSON.find(character => character.name === interaction.values[0]);  
                    if (!chosenCharacter) {
                        throw new RandomErrors(`يبدو أن هذه الشخصية قد تم حذفها دون تحديث البايانات! 🥲\n\
                            نعتذر على الخطأ الفادح سيتم اصلاح المشكل بأقرب وقت 😘`);
                    }

                    //Get characterInfo
                    const characterInfo = `--🤨لون البشرة: ${chosenCharacter.skin}\n\
                                           --🥵مستوى الشهوة: ${chosenCharacter.initialShahwaLevel}\n\
                                           --🦾نقاط الهجوم: ${chosenCharacter.initialAttack}\n\
                                           --🛡️نقاط الدفاع: ${chosenCharacter.initialDefense}\n\
                                           --🪄نقاط السحر: ${chosenCharacter.initialMagic}\n\
                                           --💪نقاط الجسم: ${chosenCharacter.initialPhysic}` ;
                    const characterCards = chosenCharacter.characterCards.map( (card, index) => {
                                                return `\*\*--البطاقة رقم ${index + 1}:\*\*\n\
                                                        إسم البطاقة: \*\*${card.name}\*\* .\n\
                                                        معرف البطاقة: \*\*${card.id}\*\* .\n\
                                                        لها \*\*${card.stages.length}\*\* مستويات .`
                                                }
                                            ).join('\n');
                    const characterInfoEmbed = new EmbedBuilder()
                    //Remember to add the character image as a thumbnile
                                            .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${botAvatar}`, })
                                            .setTitle(`${chosenCharacter.name}`)
                                            .setDescription(`${chosenCharacter.description}`)
                                            .addFields(
                                                { name: `😶‍🌫️معلومات الشخصية الأساسية:`, value: characterInfo, },
                                                { name: `🃏البطاقات الخاصة بالشخصية:`, value: characterCards, },
                                            )

                    await mainMsgObj.edit(
                                { 
                                    embeds: [characterInfoEmbed], 
                                    components: [btnRow, characterSelectRow],
                                }
                            );                         
                    const confirmeInteraction = await mainMsgObj.awaitMessageComponent({ time: 60_000, filter, });

                    //Handale the chosen character noemally
                    if (confirmeInteraction.customId === 'chose') {
                        await confirmeInteraction.deferUpdate();
                        await Management.insertManager(
                            ['player_name', 'player_id', 'character_selected', 'xp',],
                            'players',
                            [msg.author.globalName, msg.author.id, chosenCharacter.name, chosenCharacter.initialShahwaLevel]
                        );
                        await mainMsgObj.edit(
                            {
                                content: 'لقد تمت اضافتك كلاعب بنجاح!! 😘\n\
                               يرجى طباعة الأمر:  \`أوامر\` لعرض أوامر البوت 🥰',
                                embeds:[],
                                components: [],
                            }
                        );
                        return;
                    } else if (confirmeInteraction.customId === 'rules') {
                        await confirmeInteraction.deferUpdate();
                        //Take the user to the rules page 
                        return;
                    }
                    
                } catch (error) {
                    throw error;
                }
            });
            
            collectMenuInteraction.on('end', async ()=>{
                try {
                    confirmeBtn.forEach(btn => btn.setDisabled(true));
                    characterSelectMenu.setDisabled(true);
                    await rahmaResponse.edit(
                        {
                            content: `${msg.author}\nلقد إنتهى الوقت المحدد لهذه العملية ❌\n\
                                    يرجى المحاولة مرة أخرى 😘`,
                        },
                    );
                    return;
                } catch (error) {
                    throw error;
                }
            });

            return;
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`رحمة\` 🥲');
            return;
        }
    }
}