const { SlashCommandBuilder } = require('discord.js');
const { ErrorUnit, RandomErrors, FalseInput } = require('../../centralUnits/errorUnit.js');
const { Management } = require('../../dataBase.js');
const { deleteNiggas } = require('../../centralUnits/usefullFuncs.js');
require('dotenv').config();

module.exports = { 
    data: new SlashCommandBuilder()
        .setName('طرد_النيقا')
        .setDescription('حذف اللاعب مع كل انجازاته من قاعدة البيانات!!'),
    on: true,
    path: { 'adminCommands': [0, 1] }, 
    async execute(interaction){
        try {
            await interaction.deferReply({ ephemeral: true });
            
            //Check for permission
            const owners = [process.env.HAMZA];
            if(!(owners.some(id => id == interaction.user.id))) throw new RandomErrors('أنت لست ضمن صناع البوت!!\nهذا الأمر خاص بصناع البوت فقط 😘');

            //Check if the user exist
            const user = msg.mentions.users.first();
            if(!user || msg.mentions.users.size !== 1 || user.id !== args[1]?.match(/\d+/)?.[0] || user.id == msg.author.id) throw new FalseInput('طرد_نيقا');
            const isIt = await Management.selectManager(['player_name'], 'players', ['player_id'], [user.id]);
            if(isIt.length === 0) throw new RandomErrors(`${user} ليس مسجل كلاعب أصلا!!`);

            //Delete the nigga
            await deleteNiggas(Management, user);

            await interaction.editReply(`تم حذف النيقا: ${user} من قواعد \*\*بوت الرحمة الكونية\*\* بنجاح!! 😘`);
            return;
        } catch (error) {
            await ErrorUnit.throwError(error, interaction, 'حدث خطأ أثناء تنفيذ الأمر \`طرد_نيقا\` 🥲');
            return;
        }
    }
}