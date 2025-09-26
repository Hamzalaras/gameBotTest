const { SlashCommandBuilder } = require('discord.js');
const { Management } = require('../../dataBase.js');
const { ErrorUnit, RandomErrors } = require('../../centralUnits/errorUnit.js');
const cardsJson = require('../../data/cards/cards.json');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
            .setName('deploy_cards')
            .setDescription('رفع البطاقات على قاعدة البيانات فقط دون تجديد الملف!!'),
    on: true,
    path: { 'adminCommands': [0, 0] },   
    async execute(interaction){
        try {
            await interaction.deferReply({ ephemeral: true });
            //Check if is one of the owners
            const owners = [process.env.HAMZA];
            if(!(owners.some(id => id == interaction.user.id))) throw new RandomErrors('أنت لست ضمن صناع البوت!!\nهذا الأمر خاص بصناع البوت فقط 😘');

            //Get the cards that r not in the data base
            const cards = cardsJson.flatMap(t => t.cards);
            const dispoCardIds = (await Management.selectManager(['card_id'] , 'cards', [1], [1])).map(o => Object.values(o)[0]);
            for(const id of dispoCardIds){
                const index = Number(id) - 1;
                if(cards[index]) delete cards[index]; //Use this shit just cuz i v used -flatMat()- + index search in many places 
            }
            const noDispo = cards.filter (i => i !== undefined ); 

            //Set the no dispo cards
            let number = 0; //Number of inserted cards
            for(const card of noDispo){
                await Management.insertManager(['card_name', 'card_id'], 'cards', [card.name, card.id]);
                number+= 1;
            }

            await interaction.editReply(`تم تسجيل \*\*${number}\*\* بطاقات في قاعدة البيانات بنجاح!! 😘`);
            return;
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`deploy_cards\` 🥲');
            return;
        }
    }
}