const { EmbedBuilder } = require('discord.js');
const { Management } = require('../../dataBase.js');
const { ErrorUnit } = require('../../centralUnits/errorUnit.js')
const cards = require('../../data/cards/cards.json');

module.exports = {
    name: ['بطاقاتي'],
    path: { 'playCommands': [1, 0] },
    need: true,
    async execute(msg){
        try {

            const getCards = await Management.selectManager(['card_id'], 'players_cards', ['player_id'], [msg.author.id]);
            if(getCards.length == 0){
                await ErrorUnit.throwError(false, msg, `${msg.author}\nليست لديك اي بطاقة حاليا 🥲`)
                return;
            }

            const cardsIds = getCards.map(obj => obj.card_id);
            const serverAvatar = await msg.guild.iconURL({ dynamic: true, size: 2048});

            const cardEmbed = new EmbedBuilder()
                                .setTitle(`بطاقاتي`)
                                .setThumbnail(serverAvatar)
                                .setColor('Green')
                                .addFields(
                                    cards.map(type =>{
                                    let value = '';
                                    let name = '';
                                    name =  `بطاقات ${type.value}: \n`;
                                    type.cards.forEach(card => {
                                        if (cardsIds.includes(card.id)) value += `-- \*\*${card.name}\*\* `;
                                    })
                                    return {'name': name, 'value': value || 'ليس لديك اي بطاقات من هذا النوع حاليا 🥲'};
                                    })
                                )
            await msg.channel.send({content: `${msg.author}`, embeds: [cardEmbed]});
            return
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`بطاقاتي\`');
            return;
        }                      
    }
}