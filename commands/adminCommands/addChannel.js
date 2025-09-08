const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { ChannelManager } = require('../../centralUnits/channelsManager.js');
const { ErrorUnit } = require('../../centralUnits/errorUnit.js');

module.exports = {
    data: new SlashCommandBuilder()
              .setName('تحديد_روم')
              .setDescription('تحديد روم خاصة بالبوت لا يشتغل إلا فيها')
              .addChannelOption(option =>
                option.setName('الروم')
                      .setDescription('اختر الروم')
                      .setRequired(true)
                      .addChannelTypes(ChannelType.GuildText)
              ),
    on: true,         
    async execute(interaction){
        try {
            await interaction.deferReply({ ephemeral: true });
            const targetChannel = await interaction.options.getChannel('الروم');
            const guild = interaction.guild;
            if(!guild){
                interaction.editReply(`هذا الأمر صالح في السيرفر فقط!!`);
                return;
            };
            const channelManager = new ChannelManager(interaction);
            await channelManager.addChannel(guild, targetChannel, 'Administrator');
            return ;
        } catch (error) {
            await ErrorUnit.throwError(error, interaction, 'حدث خطأ أثناء تحديد الروم');
        }
    }         
}