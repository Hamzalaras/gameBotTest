const { Management } = require('../dataBase.js');
const { RandomErrors } = require('./errorUnit.js');

class ChannelManager{
    constructor(interaction){
        this.i = interaction;
        this.message = 'ليست لديك صلاحيات الأدمن في هذا السيرفر لتنفيذ هذا الأمر ❌';
    }

    async addChannel(guild, targetChannel, permission){
        try {
            const hasPermision = this.i.member.permissions.has(permission);
            if(!hasPermision) throw new RandomErrors(this.message);

            const ids = await Management.selectManager(['channel_id'], 'servers', ['server_id'], [guild.id]);
            if(ids.some(item => item.channel_id == targetChannel.id )) throw new RandomErrors(`بوت \*\*الرحمة الكونية\*\* مفعل في هذا الروم: \"${targetChannel.name}\" أصلا ❤️`);

            await Management.insertManager(
                ['server_name', 'server_id', 'channel_name', 'channel_id'], 'servers',
                [guild.name, guild.id, targetChannel.name, targetChannel.id]
            );
            await this.i.editReply(`تمت إضافة بوت الحكمة في روم: ${targetChannel.name}؛ بنجاح!`);
            return;
        } catch (error) {
            throw error;
        }
    }

    async deleteChannel(guild, targetChannel, permission){
        try {
            const hasPermision = this.i.member.permissions.has(permission);
            if(!hasPermision) throw new RandomErrors(this.message);

            const ids = await Management.selectManager(['channel_id'], 'servers', ['server_id'], [guild.id]);
            if(!ids.some(item => item.channel_id == targetChannel.id )) throw new RandomErrors(`بوت \*\*الرحمة الكونية\*\* غير مفعل في هذا الروم: \"${targetChannel.name}\" أصلا ❤️`);

            await Management.deleteManager('servers', ['channel_id'], targetChannel.id);
            await this.i.editReply(`تم حذف بوت الحكمة في روم: ${targetChannel.name} بنجاح!!`);
            return;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = { ChannelManager };