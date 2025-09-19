const { EmbedBuilder } = require('discord.js');
const { ErrorUnit, FalseInput } = require('../../centralUnits/errorUnit.js');
const { Management } = require('../../dataBase.js');
const { pointsCollector } = require('../../centralUnits/usefullFuncs.js');
const cardsJSON = require('../../data/cards/cards.json');

module.exports = {
    name: ['هاجم', 'هجوم', 'مهاجمة', 'مهاجمه'],
    path: { 'playCommands': [1, 6]},
    need: true,
    async execute(msg, args){
        try {
            const user = msg.mentions.users.first();
            if(!user || msg.mentions.users.size !== 1 || user.id !== args[1]?.match(/\d+/)?.[0] || user.id == msg.author.id) throw new FalseInput('هاجم');

            const isIt = await Management.selectManager(['player_name'], 'players', ['player_id'], [user.id]);
            if(isIt.length === 0){
                await ErrorUnit.throwError(false, msg, `${user} ليس مسجل كلاعب أصلا!!`);
                return;
            }

            const getDefenceCards = await Management.selectManager(
                ['first_card', 'second_card', 'third_card'],
                'players_team_دفاع',
                ['player_id'], [user.id]
            );
            if(getDefenceCards.length === 0){
                await ErrorUnit.throwError(false, msg, `اللاعب: ${user} لا يملك تشكيلة دفاع!!`);
                return;
            };

            const getAttaqueCards = await Management.selectManager(
                ['first_card', 'second_card', 'third_card'],
                'players_team_هجوم',
                ['player_id'], [msg.author.id]  
            );
            if(getAttaqueCards.length === 0){
                await ErrorUnit.throwError(false, msg, 'أنت لا تملك تشكيلة هجوم!!');
                return;
            };

            const [attaqueCards, defenceCrads] = [Object.values(getAttaqueCards[0]), Object.values(getDefenceCards[0])];

            const cards = cardsJSON.flatMap(type => type.cards);
            const [attaqueDeck, defenceDeck] = [attaqueCards, defenceCrads].map(type =>{
                return type.map(v => isNaN(v) ? cards.find(c => c.name === v) : cards[v - 1]);
            });

            const attaquePoints = pointsCollector(attaqueDeck, 'attaque');
            const defencePoints = pointsCollector(defenceDeck, 'defence');
            const [winner, loser] = attaquePoints > defencePoints ?
                                   [msg.author, user] : [user, msg.author] ;
            
            const resultEmbed = new EmbedBuilder()
                                 .setTitle('نتيجة الهجوم')
                                 .setDescription(`قام اللاعب: ${msg.author} بمهاجمة اللاعب: ${user}`)
                                 .addFields(
                                    { name: `تشكيلة الهجوم الخاصة باللاعب ${msg.author}:`,
                                        value: `${attaqueDeck.map(c => `\`\`${c.name}\`\``).join(' -- ')}\nمجموع قوة البطاقات: \*\*${attaquePoints}\*\* نقطة .`
                                    },
                                    { name: `تشكيلة الدفاع الخاصة باللاعب ${user}:`,
                                        value: `${defenceDeck.map(c => `\`\`${c.name}\`\``).join(' -- ')}\nمجموع قوة البطاقات: \*\*${defencePoints}\*\* نقطة .`
                                    },
                                    {
                                      name : `الفائز:`,
                                        value: `${winner}`, inline: true  
                                    },
                                    {
                                      name : `الخاسر:`,
                                        value: `${loser}`, inline: true  
                                    }
                                 );
            await msg.channel.send({constent: `${msg.author}`, embeds: [resultEmbed]}); 
            await user.send({conetent: `${user}`, embeds: [resultEmbed]});                    
            return

        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`\`هاجم\`\`');
            return;
        }
    }
}