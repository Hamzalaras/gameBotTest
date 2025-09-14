const cardsJSON = require('../../data/cards/cards.json');
const { ErrorUnit } = require('../../centralUnits/errorUnit.js');
const path = require('path');

module.exports = {
    name:['عرض'],
    path: { 'playCommands': [1, 1] },
    need: true,
    async execute(msg){
        try {
            const wanted = msg.content.trim().split(/\s+/)[1];
            
            const targetCard = undefined;
            for(const type of cardsJSON){
                targetCard = isNaN(wanted) ?
                               type.cards.find(card => card.name == wanted) :
                               type.cards.find(card => card.id == wanted);
                if(targetCard) break;               
            }

            if(!targetCard){
                await ErrorUnit.throwError(false, msg, `${msg.author} \n لم يتم ايجاد هذه البطاقة: ${wanted} 🥲`)
                return
            }  

            const photo = path.join(__dirname, '..', '..', 'data', 'cards', 'images', targetCard.photo);
            await msg.channel.send({
                content: `${msg.author}`,
                files: [photo]
            });
            return
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`عرض\`');
            return
        }
    }
}