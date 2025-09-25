const { EmbedBuilder } = require('discord.js');
const { Management } = require('../../dataBase.js');
const { ErrorUnit, RandomErrors, FalseInput } = require('../../centralUnits/errorUnit.js');
const cardsJson = require('../../data/cards/cards.json');

module.exports = {
    name: ['تشكيلة', 'مجموعة'],
    path: { 'playCommands': [1, 4]},
    need: true,
    async execute(msg, args){
        try {
            //Check the valid input
            const keyWord = ['هجوم', 'دفاع'].some(kw => kw === args[1]) ?
                            args[1] :
                            undefined;
            if(!keyWord) throw new FalseInput('تشكيلة');

            //Get the msg.author deck
            const userTeam = (await Management.selectManager(['first_card', 'second_card', 'third_card'], `players_team_${keyWord}`, ['player_id'], [msg.author.id]))[0];
            if(!userTeam) throw new RandomErrors('ليست لديك اي تشكيلة حاليا!!\nيرجى طباعة الأمر: \`مساعدة\` \`تغيير\` 😘');

            //Check if those cards still exist
            const cards = cardsJson.flatMap(type => type.cards);
            const [firstCard, secondCard, thirdCard] = [cards[userTeam.first_card_id - 1], cards[userTeam.second_card_id - 1], cards[userTeam.third_card_id - 1]];
            if(!firstCard || !secondCard || !thirdCard) throw new RandomErrors('لم يتم العثور على بطاقات التشكيلة الخاصة بكم!! 🥲');

            //Embed and shit 
            const avatar = msg.client.user.displayAvatarURL({ dynamic: true, size: 1024 });
            const contentEmbed = new EmbedBuilder()
                                     .setTitle(`🕹️تشكيلة اللاعب: ${msg.author.globalName}`)
                                     .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${avatar}`})
                                     .setDescription(`🃏\*\*تشكيلة ال${keyWord}\*\*\n`)
                                     .addFields(
                                        { name: `♠️البطاقة الأولى:`,
                                            value: `\`\`${firstCard.name}\`\`. معرفها: \*\*${firstCard.id}\*\*`
                                        },
                                        { name: `♦️البطاقة الثانية:`,
                                            value: `\`\`${secondCard.name}\`\` معرفها \*\*${secondCard.id}\*\*`
                                        },
                                        { name: `♣️البطاقة الثالثة:`,
                                            value: `\`\`${thirdCard.name}\`\` معرفها \*\*${thirdCard.id}\*\*`
                                        }
                                     );
             
            await msg.channel.send({content: `${msg.author}`, embeds: [contentEmbed]});                         
            return;
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`تشكيلة\` 🥲');
            return;
        }
    }
}