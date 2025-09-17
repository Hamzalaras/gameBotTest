const { EmbedBuilder } = require('discord.js');
const { Management } = require('../../dataBase.js');
const { ErrorUnit, FalseInput } = require('../../centralUnits/errorUnit.js');
const cardsJson = require('../../data/cards/cards.json');

module.exports = {
    name: ['تشكيلة', 'مجموعة'],
    path: { 'playCommands': [1, 4]},
    need: true,
    async execute(msg, args){
        try {
            const keyWord = ['هجوم', 'دفاع'].some(kw => kw === args[1]) ?
                            args[1] :
                            undefined;
            if(!keyWord){
                throw new FalseInput('تشكيلة');
            }

            const userTeam = (await Management.selectManager(['first_card', 'second_card', 'third_card'], `players_team_${keyWord}`, 'player_id', 33))[0];
            if(!userTeam){
                await ErrorUnit.throwError(false, msg, 'ليست لديك اي تشكيلة حاليا!!\nيرجى طباعة الأمر: \`later\`');
                return;
            }
            const cards = cardsJson.flatMap(type => type.cards);
            const [firstCard, secondCard, thirdCard] = [cards[userTeam.first_card_id - 1], cards[userTeam.second_card_id - 1], cards[userTeam.third_card_id - 1]];
            if(!firstCard || !secondCard || !thirdCard){
                await ErrorUnit.throwError(false, msg, 'لم يتم العثور على بطاقات التشكيلة الخاصة بكم!!');
                return;
            }

            const contentEmbed = new EmbedBuilder()
                                     .setTitle(`تشكيلة اللاعب: ${msg.author.globalName}`)
                                     .setDescription(`\*\*تشكيلة ال${keyWord}\*\*\n`)
                                     .addFields(
                                        {
                                          name: `اسم البطاقة:`,
                                            value: `\*\*${firstCard.name}\*\*\n\n\*\*${secondCard.name}\*\*\n\n\*\*${thirdCard.name}\*\*`,
                                            inline: true
                                        },
                                        {
                                          name: `معرف البطاقة:`,
                                            value: `\*\*${firstCard.id}\*\*\n\n\*\*${secondCard.id}\*\*\n\n\*\*${thirdCard.id}\*\*`,
                                            inline: true
                                        },
                                        { name: `رقم البطاقة:`,
                                            value: `الأولى:\n\nالثانية:\n\nالثالة:`,
                                            inline: true
                                        }
                                     )
             
            await msg.channel.send({content: `${msg.author}`, embeds: [contentEmbed]});                         
            return
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`تشكيلة\`');
            return;
        }
    }
}