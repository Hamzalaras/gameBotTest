const {  } = require('discord.js');
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

            const userTeam = (await Management.selectManager(['first_card_id', 'second_card_id', 'third_card_id'], `players_team_${keyWord}`, 'player_id', msg.author.id))[0];
            const [firstId, secondId, thirdId] = [userTeam.first_card_id, userTeam.second_card_id, userTeam.third_card_id];
            const [firstCard, secondCard, thirdCard] = [ , , ];
            for(const type of cardsJson){
                const cards = type.cards;
                for(const card of cards){
                }
            }
        } catch (error) {
            
        }
    }
}