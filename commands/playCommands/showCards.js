const cardsJSON = require('../../data/cards/cards.json');
const { ErrorUnit, RandomErrors } = require('../../centralUnits/errorUnit.js');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name:['عرض'],
    path: { 'playCommands': [1, 1] },
    need: true,
    async execute(msg){
        try {
            //Get the keyWord
            const wanted = msg.content.trim().split(/\s+/)[1];
            
            //I ve used a for of loop to get the card, but u can use -flatMap()- and -find()- for a short syntax
            // but that will consume more memory
            let [targetCard, Cardtype] = [undefined, undefined];
            for(const type of cardsJSON){
                targetCard = isNaN(wanted) ?
                               type.cards.find(card => card.name === wanted) :
                               type.cards.find(card => card.id === wanted);

                if(targetCard){Cardtype = type; break};               
            }
            if(!targetCard) throw new RandomErrors(`لم يتم ايجاد هذه البطاقة: ${wanted} 🥲`);

            //Get th photo path
            const photo = path.join(__dirname, '..', '..', 'data', 'cards', 'images', targetCard.photo);

            //Embed info and shit 
            const avatar = msg.client.user.displayAvatarURL({ dynamic: true, size: 1024 });
            const embedInfo = new EmbedBuilder()
                                  .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${avatar}`})
                                  .setColor('Red')
                                  .setTitle(`🃏عرض البطاقة: ${targetCard.name}🃏`)
                                  .addFields(
                                    { name: `♠️خصائص البطاقة:`,
                                        value: `👾النوع: \*\*${targetCard.nature}\*\* .\n❕الصنف: \*\*${targetCard.type}\*\* .\n💪نقاط القوة: \*\*${targetCard.power}\*\* .\n🔢عدد الإستخدامات الإبتدائية: \*\*${targetCard.usesLeft}\*\* .\nمعرف البطاقة: \*\*${targetCard.id}\*\* .`
                                    }
                                  );
                                  


            await msg.channel.send({ content: `${msg.author}`, embeds: [embedInfo], files: [photo]});
            return;
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`عرض\`');
            return;
        }
    }
}