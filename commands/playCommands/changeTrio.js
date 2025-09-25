const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, Events } = require('discord.js');
const { ErrorUnit, RandomErrors, FalseInput } = require('../../centralUnits/errorUnit.js');
const cardsJson = require('../../data/cards/cards.json');
const { Management } = require('../../dataBase.js'); 

module.exports = {
    name: ['تغيير', 'إستبدال',  'استبدال', 'تبديل'],
    path: { 'playCommands': [1, 5]},
    need: true,
    async execute(msg, args){
        try {
            //Check the valid input 
            if(args[1] !== 'تشكيلة') throw new FalseInput('تغيير');

            //Embeds and shit
            const avatar = msg.client.user.displayAvatarURL({ dynamic: true, size: 1024 });
            const confirmationEmbed = new EmbedBuilder()
                                          .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${avatar}`})
                                          .setTitle('🕹️تغيير تشكيلة اللاعب')
                                          .setDescription('🃏الرجاء إختيار تشكيلة لتغييرها')
                                          .setColor('Red');

            const buttons = [
                new ButtonBuilder().setCustomId('هجوم').setLabel('هجوم').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('دفاع').setLabel('دفاع').setStyle(ButtonStyle.Primary)
            ];
            const row = new ActionRowBuilder().addComponents(buttons);
            
            const filter = i => i.user.id === msg.author.id ;
            const confirmationMsg = await msg.channel.send({
                content: `${msg.author}`,
                embeds: [confirmationEmbed],
                components: [row],
                filter
            });
            const collector = await confirmationMsg.awaitMessageComponent({ filter, time: 30_000});

            //Managing the collector whatever was the customId
            if(collector.customId){

                //Making the buttons disabled to prevent errors
                buttons.forEach(btn => btn.setDisabled(true));
                await confirmationMsg.edit({components: [row]});

                //Modal and shit 
                const ky = collector.customId;
                const modal = new ModalBuilder()
                                .setTitle(`تغيير تشكيلة ال${ky}`)
                                .setCustomId('modal');
                const fields = [
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

                modal.addComponents(fields.map(f => new ActionRowBuilder().addComponents(f)));
                await collector.showModal(modal);
                const submitted = await collector.awaitModalSubmit({ filter, time: 120_000 });
                await submitted.deferUpdate();

                //Handling the modal and values
                if(submitted.customId !== 'modal') return;
                const [firstValue, secondValue, thirdValue] = [ 
                                                            submitted.fields.getTextInputValue('firstCard'),
                                                            submitted.fields.getTextInputValue('secondCard'),
                                                            submitted.fields.getTextInputValue('thirdCard')
                                                            ];
                if(firstValue == secondValue || secondValue == thirdValue || firstValue == thirdValue) throw new RandomErrors('يرجى إدخال قيم مختلفة عن بعضها البعض في كل خانة 😘');

                const cards = cardsJson.flatMap(type => type.cards);
                const [firstCardObj, secondCardObj, thirdCardObj] =  [firstValue, secondValue, thirdValue].map(v => 
                                                            isNaN(v) 
                                                                ? cards.find(c => c.name === v) 
                                                                : cards[v - 1]
                                                            );
                if(!firstCardObj || !secondCardObj || !thirdCardObj) throw new RandomErrors(`لم يتم العثور على المعلومات التي تم إدخالها!!: \`\`${firstValue}\`\` \`\`${secondValue}\`\` \`\`${thirdValue}\`\` 🥲`);

                //Check if the msg.author have the given values
                const dispoArr = [
                    await Management.selectManager(['card_id'], 'players_card', ['player_id', 'card_id'], [msg.author.id, firstCardObj.id]),
                    await Management.selectManager(['card_id'], 'players_card', ['player_id', 'card_id'], [msg.author.id, secondCardObj.id]),
                    await Management.selectManager(['card_id'], 'players_card', ['player_id', 'card_id'], [msg.author.id, thirdCardObj.id])
                ] ;
                for(let i = 0; i < dispoArr.length; i++){
                    if(dispoArr[i].length === 0){
                        throw new RandomErrors(`ليس لديك البطاقة رقم \*\*${i}\*\* التي أدخلتها!!`);
                    }
                }                                      
                
                //Updating the deck if exist or insert it if not
                const oldTrio = await Management.selectManager(['first_card', 'second_card', 'third_card'], `players_team_${ky}`, ['player_id'], [msg.author.id]);
                oldTrio.length > 0 ? 
                    await Management.updateManager(
                        ['first_card', 'second_card', 'third_card'],
                        `players_team_${ky}`,
                        [`${firstCardObj.id}`, `${secondCardObj.id}`, `${thirdCardObj.id}`],
                        'player_id', msg.author.id
                    ) :
                    await Management.insertManager(
                        ['player_id' ,'first_card', 'second_card', 'third_card'],
                        `players_team_${ky}`,
                        [msg.author.id ,`${firstCardObj.id}`, `${secondCardObj.id}`, `${thirdCardObj.id}`]
                    ) ;
                
                //Send successe
                confirmationEmbed.setDescription(`تم تحديث تشكيلة \*\*ال${ky}\*\* الخاصة بكم بنجاح 😘`);
                await confirmationMsg.edit({
                    content: `${msg.author}`,
                    embeds: [confirmationEmbed],
                    components: []
                });
                return;
            }
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`تغيير\` 🥲');
            return;
        }
    }
}    