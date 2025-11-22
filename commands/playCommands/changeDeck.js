const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder } = require('discord.js');
const { ErrorUnit, RandomErrors, FalseInput } = require('../../centralUnits/errorUnit.js');
const { traduction } = require('../../centralUnits/usefullFuncs.js');
const cardsJson = require('../../data/cards/cards.json');
const { Management } = require('../../dataBase.js'); 

module.exports = {
    name: ['تغيير', 'إستبدال',  'استبدال', 'تبديل'],
    category: 'player',
    need: true,
    async execute(msg, args){
    
        let mainMsgObj;
        try {
            //Check the valid input 
            const keyWordAlias = ['تشكيلة', 'تشكيله', 'التشكيلة', 'التشكيله', 'المجموعة', 'مجموعة', 'مجموعه', 'المجموعه'];
            if ( !( keyWordAlias.includes(args[1]) ) ) {
                throw new FalseInput('تغيير');
            }

            //Embeds and shit
            const botAvatar = msg.client.user.displayAvatarURL({ dynamic: true, size: 1024 });
            const mainEmbed = new EmbedBuilder()
                                    .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${botAvatar}`})
                                    .setTitle('🕹️تغيير تشكيلة اللاعب')
                                    .setDescription('🃏الرجاء إختيار تشكيلة لتغييرها')
                                    .setColor('Red');

            const deckTypeBtns = 
                [
                    new ButtonBuilder().setCustomId('هجوم').setLabel('هجوم').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('دفاع').setLabel('دفاع').setStyle(ButtonStyle.Primary)
                ];
            const btnsRow = new ActionRowBuilder().addComponents(deckTypeBtns);
            
            const filter = i => i.user.id === msg.author.id ;
            mainMsgObj = await msg.channel.send(
                            {
                                content: `${msg.author}`,
                                embeds: [mainEmbed],
                                components: [btnsRow],
                            }
                        );
            const getChosenType = await mainMsgObj.awaitMessageComponent({ filter, time: 3_000 });

            //Managing the collector whatever was the customId
            if(getChosenType.customId){
                //Making the buttons disabled to prevent errors
                deckTypeBtns.forEach( btn => btn.setDisabled(true) );
                await mainMsgObj.edit({ components: [btnsRow] });

                //Modal and shit 
                const arabicTypeName = getChosenType.customId;
                const deckType = traduction(arabicTypeName);
                const modal = new ModalBuilder()
                                .setTitle(`تغيير تشكيلة ال${arabicTypeName}`)
                                .setCustomId('modal');
                const modalFields = [
                    new TextInputBuilder()
                                .setCustomId('firstCard')
                                .setLabel('إسم أو معرف (id) أول بطاقة')
                                .setStyle(1)
                                .setRequired(true),
                    new TextInputBuilder()
                                .setCustomId('secondCard')
                                .setLabel('إسم أو معرف (id) ثاني بطاقة')
                                .setStyle(1)
                                .setRequired(true),   
                    new TextInputBuilder()
                                .setCustomId('thirdCard')
                                .setLabel('إسم أو معرف (id) ثالث بطاقة')
                                .setStyle(1)
                                .setRequired(true)                     
                ];

                modal.addComponents( modalFields.map( f => new ActionRowBuilder().addComponents(f) ) );
                await getChosenType.showModal(modal);
                const getModalInfo = await getChosenType.awaitModalSubmit({ filter, time: 120_000 });
                await getModalInfo.deferUpdate();

                //Handling the modal and values
                if (getModalInfo.customId) {
                    
                    const [firstValue, secondValue, thirdValue] = 
                        [ 
                            submitted.fields.getTextInputValue('firstCard'),
                            submitted.fields.getTextInputValue('secondCard'),
                            submitted.fields.getTextInputValue('thirdCard')
                        ];
                    if (firstValue === secondValue || secondValue === thirdValue || firstValue === thirdValue) {
                        throw new RandomErrors('يرجى إدخال قيم مختلفة عن بعضها البعض في كل خانة 😘');
                    }

                    const cards = cardsJson.flatMap(type => type.cards);
                    const [firstCard, secondCard, thirdCard] = 
                        [firstValue, secondValue, thirdValue].map(value => {
                                                                    return isNaN(value) ?
                                                                            cards.find(card => card.name === value) 
                                                                            : cards.find(card => card.id === value)
                                                                    }
                                                                );
                    if (!firstCard || !secondCard || !thirdCard) {
                        throw new RandomErrors(`لم يتم العثور على المعلومات التي تم إدخالها!!: \
                            \`\`${firstValue}\`\` -- \`\`${secondValue}\`\` -- \`\`${thirdValue}\`\` .`);
                    }

                    //Check if the msg.author have the given values
                    const hasCards = 
                        [
                            ( await Management.selectManager(['card_id'], 'players_cards', ['player_id', 'card_id'], [msg.author.id, firstCard.id]) )[0],
                            ( await Management.selectManager(['card_id'], 'players_cards', ['player_id', 'card_id'], [msg.author.id, secondCard.id]) )[0],
                            ( await Management.selectManager(['card_id'], 'players_cards', ['player_id', 'card_id'], [msg.author.id, thirdCard.id]) )[0]
                        ];
                    for (let i = 0; i < hasCards.length; i++) {
                        if (!hasCards[i]) {
                            throw new RandomErrors(`ليس لديك البطاقة رقم \*\*${i}\*\* التي أدخلتها!!`);
                        }
                    }                                      
                    
                    //Updating the deck if exist or insert it if not)
                    const dbTableName = `players_team_${deckType}`
                    const oldDeck = ( await Management.selectManager(
                                                ['first_card','second_card','third_card'],
                                                dbTableName, 
                                                ['player_id'], 
                                                [msg.author.id]
                                            )
                                    )[0];
                    oldDeck ? 
                        await Management.updateManager(
                            ['first_card', 'second_card', 'third_card'],
                            dbTableName,
                            [firstCard.id, secondCard.id, thirdCard.id],
                            ['player_id'],
                            [msg.author.id]
                        ) :
                        await Management.insertManager(
                            ['player_id' ,'first_card', 'second_card', 'third_card'],
                            dbTableName,
                            [msg.author.id ,firstCard.id, secondCard.id, thirdCard.id]
                        ) ;
                    
                    //Send successe
                    confirmationEmbed.setDescription(`تم تحديث تشكيلة \*\*ال${arabicTypeName}\*\* الخاصة بكم بنجاح 😘`);
                    await mainMsgObj.edit(
                        {
                            content: `${msg.author}`,
                            embeds: [mainEmbed],
                            components: []
                        }
                    );
                }
            }

            return;
        } catch (error) {
            if ( ( error.code === 'InteractionCollectorError' || error.message.includes('time') ) && mainMsgObj) {
                try {
                    await mainMsgObj.edit(
                        {
                            content: `${msg.author}\nلقد إنتهى الوقت المحدد لهذه العملية ❌\nيرجى المحاولة مرة أخرى 😘`,
                            components: []
                        }
                    );
                    return;
                } catch (error) {
                    throw error;
                }
            } 
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`تغيير\` 🥲');
            return;
        }
    }
}    