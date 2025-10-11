const { Events } = require('discord.js');
const { Management } = require('../dataBase.js');
const { ErrorUnit, RandomErrors } = require('../centralUnits/errorUnit.js');

module.exports = {
    on: true, 
    name: Events.MessageCreate,
    async execute(msg){
        try {
            if(msg.author.bot) return;
            const getIds = await Management.selectManager(['channel_id'], 'servers', ['server_id'], [msg.guild.id]);
            if(getIds.length > 0 && !getIds.some(item => item.channel_id === msg.channel.id)) return;

            //Check if the nigga is baned befor 
            const banedBefor = (await Management.selectManager(['player_id'], 'players_baned', ['player_id'], [msg.author.id])).length !== 0;
            if(banedBefor) throw new RandomErrors('أنت محظور من التسجيل في بوت الرحمة الكونية!! 🥲\nيرجى طلب الإعتراض في سيرفر البوت 😘'); 

            const commandsNames = [...msg.client.commands.keys()];
            const args = await msg.content.trim().split(/\s+/);            
            const targetCommand = commandsNames.map(name => msg.client.commands.get(name))
                                               .find(command => command.name && command.name.includes(args[0]));
            if(!targetCommand) return;
            const exist = (await Management.selectManager(['player_id'], 'players', ['player_id'], [msg.author.id])).length > 0 ;
            if(!(exist === targetCommand.need) && targetCommand.need !== undefined ) throw new RandomErrors(`لا يمكنك تنفيذ هذا الأمر: \`${args[0]}\` 🥲`);

            await targetCommand.execute(msg, args);
            return;
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء توجيه الأمر');
            return
        }
    }
}