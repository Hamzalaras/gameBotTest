const { EmbedBuilder } = require('discord.js');
const { Management } = require('../../dataBase.js');
const { ErrorUnit, RandomErrors } = require('../../centralUnits/errorUnit.js');
const { getLvl } = require('../../centralUnits/usefullFuncs.js');
const cardsJson = require('../../data/cards/cards.json');

module.exports = {
    name: ['بطاقاتي'],
    category: 'player',
    need: true,
    async execute(msg){
        try {
            //Get the cards
            const userCards = await Management.selectManager(['card_id'], 'players_cards', ['player_id'], [msg.author.id]);
            
            if ( !(userCards.length) ) {
                throw new RandomErrors('ليست لديك اي بطاقة حاليا 🥲');
            }
            const userCardsIds = new Set(userCards.map(card => card.card_id));
            const userCradsMap = new Map();

            let founded = 0;
            cardsJson.forEach(type => {
                    const list = []
                    userCradsMap.set(type.value, list);
                    for (const card of type.cards) {
                        if (userCardsIds.length == founded) break;
                        if ( userCardsIds.has(card.id) ) {
                            list.push(card);
                            founded++;
                        }
                    }

                }
            );
                    
            if (userCardsIds.length != founded) {
                const lostUserCardsNbr = userCardsIds.length - founded;
                throw new RandomErrors(`لم يتم إيجاد: ${lostUserCardsNbr} بطاقات من بطاقاتك!! 🥲`);
            }

            const fileds = [];
            for (const [type, cards] of userCradsMap) {
                const cardsValue = cards.length ?
                                   cards.map(card => `\*\*${card.name}\*\*`).join(' -- ') :
                                   'ليس لديك اي بطاقات من هذا النوع حاليا 🥲';
                fileds.push(
                    {
                        name: `🃏بطاقات من النوع \*\*${type}\*\*:`,
                        value: cardsValue,
                    },
                );
            }

            //Simple map function to get the cards, && embed and shit 
            const botAvatar = msg.client.user.displayAvatarURL({ dynamic: true, size: 1024, });
            const mainEmbed = new EmbedBuilder()
                                .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${botAvatar}`, })
                                .setTitle(`🕹️بطاقات اللاعب : ${msg.author.globalName}`)
                                .setColor('Green')
                                .addFields(fileds);

            await msg.channel.send({ content: `${msg.author}`, embeds: [mainEmbed] });

            return;
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`بطاقاتي\` 🥲');
            return;
        }                      
    }
}