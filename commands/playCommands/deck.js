const { EmbedBuilder } = require('discord.js');
const { Management } = require('../../dataBase.js');
const { ErrorUnit, RandomErrors, FalseInput } = require('../../centralUnits/errorUnit.js');
const { traduction } = require('../../centralUnits/usefullFuncs.js');
const cardsJson = require('../../data/cards/cards.json');

module.exports = {
    name: ['تشكيلة', 'مجموعة'],
    category: 'player',
    need: true,
    async execute(msg, args){
        try {
            //Check the valid input
            const deckType = traduction(args[1]);
            if (!deckType) { 
                throw new FalseInput('تشكيلة');
            }

            //Get the msg.author deck
            const dbTableName = `players_team_${deckType}`
            const deck = (  await Management.selectManager(
                                    ['first_card', 'second_card', 'third_card'], 
                                    dbTableName, 
                                    ['player_id'], 
                                    [msg.author.id]
                                )
                            )[0];
                        
            if (!deck) {
                throw new RandomErrors('ليست لديك اي تشكيلة حاليا!!\nيرجى طباعة الأمر: \`مساعدة\` \`تغيير\` 😘');
            } 

            //Check if those cards still exist
            const cards = cardsJson.flatMap(type => type.cards);
            const deckIds = Object.values(deck);
            const [firstCard, secondCard, thirdCard] = deckIds.map(id => cards.find(card => card.id === id));
            if (!firstCard || !secondCard || !thirdCard) {
                throw new RandomErrors('لم يتم العثور على بطاقات التشكيلة الخاصة بكم!! 🥲');
            }

            //Embed and shit 
            const avatar = msg.client.user.displayAvatarURL({ dynamic: true, size: 1024 });
            const contentEmbed = new EmbedBuilder()
                                     .setTitle(`🕹️تشكيلة اللاعب: ${msg.author.globalName}`)
                                     .setColor('Red')
                                     .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${avatar}`, })
                                     .setDescription(`🃏\*\*تشكيلة ال${args[1]}\*\*🃏`)
                                     .addFields(
                                        { name: `♠️البطاقة الأولى:`,
                                            value: `-- \`\`${firstCard.name}\`\`.\n-- معرفها: \*\*${firstCard.id}\*\* .`
                                        },
                                        { name: `♦️البطاقة الثانية:`,
                                            value: `-- \`\`${secondCard.name}\`\`.\n-- معرفها: \*\*${secondCard.id}\*\* .`
                                        },
                                        { name: `♣️البطاقة الثالثة:`,
                                            value: `-- \`\`${thirdCard.name}\`\`.\n-- معرفها: \*\*${thirdCard.id}\*\* .`
                                        },
                                     );
             
            await msg.channel.send({ content: `${msg.author}`, embeds: [contentEmbed], }); 

            return;
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`تشكيلة\` 🥲');
            return;
        }
    }
}