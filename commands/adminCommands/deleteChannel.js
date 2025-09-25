const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { ChannelManager } = require('../../centralUnits/channelsManager.js');
const { ErrorUnit } = require('../../centralUnits/errorUnit.js');

module.exports = {
    data: new SlashCommandBuilder()
              .setName('حذف_روم')
              .setDescription('حذف البوت من إحدى الرومات')
              .addChannelOption(option =>
                option.setName('الروم')
                      .setDescription('اختر الروم')
                      .setRequired(true)
                      .addChannelTypes(ChannelType.GuildText)
              ),
    on: true,
    path: { 'adminCommands': [0, 1] },             
     async execute(interaction){
        try {            
            await interaction.deferReply({ ephemeral: true });
            const targetChannel = await interaction.options.getChannel('الروم');
            const guild = interaction.guild;
            if(!guild) throw new RandomErrors('هذا الأمر صالح في السيرفر فقط!! 😘');

            const channelManager = new ChannelManager(interaction);
            await channelManager.deleteChannel(guild, targetChannel, 'Administrator');
            return ;
        } catch (error) {
            await ErrorUnit.throwError(error, interaction, 'حدث خطأ أثناء حذف الروم');
            return;
        }
    }          
}