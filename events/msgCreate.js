const { Events } = require('discord.js');
const { Management } = require('../dataBase.js');
const { ErrorUnit } = require('../centralUnits/errorUnit.js');

module.exports = {
    on: true, 
    name: Events.MessageCreate,
    async execute(msg){
        try {
            if(msg.author.bot) return;
            const getIds = await Management.selectManager(['channel_id'], 'servers', 'server_id', msg.guild.id);
            if(getIds.length > 0 && !getIds.some(item => item.channels_ids === msg.channel.id)) return;

            const commandsNames = [...msg.client.commands.keys()];
            const args = await msg.content.trim().split(/\s+/);            
            const targetCommand = commandsNames.map(name => msg.client.commands.get(name))
                                               .find(command => command.name && command.name.includes(args[0]));
            if(!targetCommand) return;
            
            await targetCommand.execute(msg, args);
            return;
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء توجيه الأمر')
        }
    }
}