const { Events } = require('discord.js');

module.exports = {
    name:Events.InteractionCreate,
    on: true,
    async execute(interaction){
	    if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
        if(!command) return await interaction.reply(`لا يوجد امر بهذا الإسم: ${interaction.commandName}. <3`);

        try {
            command.execute(interaction);
        } catch (error) {
            console.error(error);
        }
    }
}