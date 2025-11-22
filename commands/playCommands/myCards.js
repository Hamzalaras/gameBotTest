const { EmbedBuilder } = require('discord.js');
const { Management } = require('../../dataBase.js');
const { ErrorUnit, RandomErrors } = require('../../centralUnits/errorUnit.js')
const cards = require('../../data/cards/cards.json');

module.exports = {
    name: ['بطاقاتي'],
    path: { 'playCommands': [1, 0] },
    need: true,
    async execute(msg){
        try {
            //Get the cards
            const getCards = await Management.selectManager(['card_id'], 'players_cards', ['player_id'], [msg.author.id]);
            if(getCards.length == 0) throw new RandomErrors('ليست لديك اي بطاقة حاليا 🥲');

            const cardsIds = getCards.map(obj => obj.card_id);

            //Simple map function to get the cards, && embed and shit 
            const avatar = msg.client.user.displayAvatarURL({ dynamic: true, size: 1024 });
            const cardEmbed = new EmbedBuilder()
                                .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${avatar}`})
                                .setTitle(`🕹️بطاقات اللاعب : ${msg.author.globalName}`)
                                .setColor('Green')
                                .addFields(
                                    cards.map(type =>{
                                    let value = '';
                                    const name =  `بطاقات ${type.value}: \n`;
                                    type.cards.forEach(card => {
                                        if (cardsIds.includes(card.id)) value += `-- \*\*${card.name}\*\* `;
                                    })
                                    return { name , 'value': value || 'ليس لديك اي بطاقات من هذا النوع حاليا 🥲'};
                                    })
                                )
            await msg.channel.send({content: `${msg.author}`, embeds: [cardEmbed]});
            return
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`بطاقاتي\` 🥲');
            return;
        }                      
    }
}