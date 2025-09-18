const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, Events } = require('discord.js');
const { ErrorUnit, CollectorError } = require('../../centralUnits/errorUnit.js');
const cardsJson = require('../../data/cards/cards.json');
const { Management } = require('../../dataBase.js'); 

module.exports = {
    name: ['تغيير', 'إستبدال',  'استبدال', 'تبديل'],
    path: { 'playCommands': [1, 5]},
    need: true,
    async execute(msg, args){
        try {
            
            if(args[1] !== 'تشكيلة'){
                throw new FalseInput('تغيير');
            }
            const confirmationEmbed = new EmbedBuilder()
                                          .setTitle('تغيير تشكيلة')
                                          .setDescription('الرجاء إختيار تشكيلة لتغييرها')
            const attaqueBtn = new ButtonBuilder()
                                   .setCustomId('هجوم')
                                   .setLabel('هجوم')  
                                   .setStyle(ButtonStyle.Primary);
            const defenceBtn = new ButtonBuilder()
                        .setCustomId('دفاع')
                        .setLabel('دفاع')  
                        .setStyle(ButtonStyle.Primary);
            const row = new ActionRowBuilder().addComponents(attaqueBtn, defenceBtn);
            
            const filter = i => i.user.id === msg.author.id ;
            const confirmationMsg = await msg.channel.send({
                content: `${msg.author}`,
                embeds: [confirmationEmbed],
                components: [row],
                filter
            });
            const collector = await confirmationMsg.awaitMessageComponent({ filter, time: 30_000});

            if(collector.customId){
                
                [attaqueBtn, defenceBtn].forEach(btn => btn.setDisabled(true));
                await confirmationMsg.edit({components: [row]});
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
                const rows = fields.map(f => new ActionRowBuilder().addComponents(f));
                modal.addComponents(rows);
                await collector.showModal(modal);
                const submitted = await collector.awaitModalSubmit({ filter, time: 120_000 });
                await submitted.deferUpdate();

                if(submitted.customId !== 'modal') return;
                const [firstValue, secondValue, thirdValue ] = [ 
                                                            submitted.fields.getTextInputValue('firstCard'),
                                                            submitted.fields.getTextInputValue('secondCard'),
                                                            submitted.fields.getTextInputValue('thirdCard')
                                                            ];

                if(firstValue == secondValue || secondValue == thirdValue || firstValue == thirdValue){
                    await ErrorUnit.throwError(false, msg, 'يرجى إدخال قيم مختلفة عن بعضها البعض في كل خانة');
                    return;
                }

                const cards = cardsJson.flatMap(type => type.cards);
                const [firstCard, secondCard, thirdCard] =  [firstValue, secondValue, thirdValue].map(v => 
                                                            isNaN(v) 
                                                                ? cards.find(c => c.name === v) 
                                                                : cards[v - 1]
                                                            );

                if(!firstCard || !secondCard || !thirdCard){
                    await ErrorUnit.throwError(false, msg, `لم يتم العثور على المعلومات التي تم إدخالها!!: \`\`${firstValue}\`\` \`\`${secondValue}\`\` \`\`${thirdValue}\`\``);
                    return;
                }
                                    
                const oldTrio = await Management.selectManager(['first_card', 'second_card', 'third_card'], `players_team_${ky}`, 'player_id', msg.author.id);
                oldTrio.length > 0 ? 
                    await Management.updateManager(
                        ['first_card', 'second_card', 'third_card'],
                        `players_team_${ky}`,
                        [`${firstCard.id}`, `${secondCard.id}`, `${thirdCard.id}`],
                        'player_id', msg.author.id
                    ) :
                    await Management.insertManager(
                        ['player_id' ,'first_card', 'second_card', 'third_card'],
                        `players_team_${ky}`,
                        [msg.author.id ,`${firstCard.id}`, `${secondCard.id}`, `${thirdCard.id}`]
                    ) ;

                confirmationEmbed.setDescription(`تم تحديث تشكيلة ال${ky} الخاصة بكم بنجاح 😘`);
                await confirmationMsg.edit({
                    content: `${msg.author}`,
                    embeds: [confirmationEmbed],
                    components: []
                });
                return;

            }

        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`تغيير\`');
            return;
        }
    }
}    