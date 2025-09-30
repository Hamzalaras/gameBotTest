const { SlashCommandBuilder } = require('discord.js');
const { ErrorUnit, RandomErrors, FalseInput } = require('../../centralUnits/errorUnit.js');
const { Management } = require('../../dataBase.js');
const { deleteNiggas } = require('../../centralUnits/usefullFuncs.js');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('حظر_النيقا')
        .setDescription('حظر اللاعب من التسجيل في بوت الرحمة الكونية مع طرده إن وجد!!'),
    on: true,
    path: { 'adminCommands': [0, 2] }, 
    async execute(interaction){
        try {
            await interaction.deferReply({ ephemeral: true });
            
            //Check for permission
            const owners = [process.env.HAMZA];
            if(!(owners.some(id => id == interaction.user.id))) throw new RandomErrors('أنت لست ضمن صناع البوت!!\nهذا الأمر خاص بصناع البوت فقط 😘');

            //Check if the user exist
            const user = msg.mentions.users.first();
            if(!user || msg.mentions.users.size !== 1 || user.id !== args[1]?.match(/\d+/)?.[0] || user.id == msg.author.id) throw new FalseInput('طرد_نيقا');

            //Delete the nigga 
            await deleteNiggas(Management, user);
            //Check if baned to ban or not to ban
            const banedBefor = await Management.selectManager(['player_id'], 'players_baned', ['player_id'], [user.id]);
            if(banedBefor.length !== 0 ) throw new RandomErrors(`هذا النيقا: ${user} محظور أصلا!!`); 
            await Management.insertManager(['player_id'], 'players_baned', [user.id]);

            await interaction.editReply(`تم حظر النيقا: ${user} من التسجيل في \*\*بوت الرحمة الكونية\*\* بنجاح!! 😘`);
            return;
        } catch (error) {
            await ErrorUnit.throwError(error, interaction, 'حدث خطأ أثناء تنفيذ الأمر \`حظر_نيقا\` 🥲');
            return;
        }
    }
}