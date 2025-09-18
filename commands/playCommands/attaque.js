const {  } = require('discord.js');
const { ErrorUnit, FalseInput } = require('../../centralUnits/errorUnit.js');
const { Management } = require('../../dataBase.js');
const cardsJSON = require('../../data/cards/cards.json');

module.exports = {
    name: ['هاجم', 'هجوم', 'مهاجمة', 'مهاجمه'],
    path: { 'playCommand': [1, 6]},
    need: true,
    async execute(msg, args){
        try {
            const user = msg.mentions.users.first();
            if(!user || msg.mentions.users.size !== 1 || user.id !== args[1]?.match(/\d+/)?.[0]) throw new FalseInput('هاجم');
            const getDefenceCards = await Management.selectManager(
                ['first_card', 'second_card', 'third_card'],
                'players_team_دفاع',
                'player_id', user.id
            );
            if(getDefenceCards.length === 0){
                await ErrorUnit.throwError(false, msg, `اللاعب: ${user} لا يملك تشكيلة دفاع!!`);
                return;
            };

            const getAttaqueCards = await Management.selectManager(
                ['first_card', 'second_card', 'third_card'],
                'players_team_هجوم',
                'player_id', msg.author.id   
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



        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`\`هاجم\`\`');
            return;
        }
    }
}