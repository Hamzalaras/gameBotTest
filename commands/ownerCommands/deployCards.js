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
    category: 'owner',
    async execute(interaction){
        try {
            await interaction.deferReply({ ephemeral: true });
            //Check if is one of the owners
            const owners = [process.env.HAMZA];
            if ( !( owners.includes(interaction.user.id) ) ) {
                throw new RandomErrors('أنت لست ضمن صناع البوت!!\nهذا الأمر خاص بصناع البوت فقط 😘');
            }

            //Get the cards that r not in the data base
            const cards = cardsJson.flatMap(value => value.cards);
            const dbCards = await Management.selectManager(
                                        ['card_id'] ,
                                        'cards', 
                                        [1],
                                        [1]
                                    );

            const dbCardIds = new Set( dbCards.map(obj => obj.card_id) );
            const cardsToUpload = cards.filter( card => !(dbCardIds.has(card.id)) ); 

            //Set the no dispo cards
            const promises = cardsToUpload.map(card => 
                Management.insertManager(['card_name', 'card_id'], 'cards', [card.name, card.id])
            );

            //Wait for all insertions to complete
            await Promise.all(promises); 

            const insertedNbr = cardsToUpload.length; 

            await interaction.editReply(`تم تسجيل \*\*${insertedNbr}\*\* بطاقات في قاعدة البيانات بنجاح!! 😘`);

            return;
        } catch (error) {
            await ErrorUnit.throwError(error, interaction, 'حدث خطأ أثناء تنفيذ الأمر \`deploy_cards\` 🥲');
            return;
        }
    }
}