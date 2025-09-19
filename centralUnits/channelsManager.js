const { Management } = require('../dataBase.js');
const { ErrorUnit } = require('./errorUnit.js');

class ChannelManager{
    constructor(interaction){
        this.i = interaction;
        this.message = 'ليست لديك صلاحيات ادمن في هذا السيرفر لتنفيذ هذا الأمر❌';
    }

    async addChannel(guild, targetChannel, permission){
        try {
            const hasPermision = this.i.member.permissions.has(permission);
            if(!hasPermision){
                await this.i.editReply(`${this.message}`);
                return;
            }

            const ids = await Management.selectManager(['channel_id'], 'servers', ['server_id'], [guild.id]);
            if(ids.some(item => item.channel_id == targetChannel.id )){
                await this.i.editReply(`بوت الحكمة مفعل في هذا الروم: \"${targetChannel.name}\" أصلا.`);
                return;
            }

            await Management.insertManager(
                ['server_name', 'server_id', 'channel_name', 'channel_id'], 'servers',
                [guild.name, guild.id, targetChannel.name, targetChannel.id]
            );
            await this.i.editReply(`تمت إضافة بوت الحكمة في روم: ${targetChannel.name}؛ بنجاح!`);
            return;
        } catch (error) {
            await ErrorUnit.throwError(error, this.i);
            return;
        }
    }

    async deleteChannel(guild, targetChannel, permission){
        try {
            const hasPermision = this.i.member.permissions.has(permission);
            if(!hasPermision){
                await this.i.editReply(`${this.message}`);
                return;
            }

            const ids = await Management.selectManager(['channel_id'], 'servers', ['server_id'], [guild.id]);
            if(!ids.some(item => item.channel_id == targetChannel.id )){
                await this.i.editReply(`بوت الحكمة غير مفعل في هذا الروم: "${targetChannel.name}" أصلا.`);
                return;
            }

            await Management.deleteManager('servers', ['channel_id'], targetChannel.id);
            await this.i.editReply(`تم حذف بوت الحكمة في روم: ${targetChannel.name} بنجاح!!`);
            return;
        } catch (error) {
            await ErrorUnit.throwError(error, this.i);
            return;
        }
    }
}

module.exports = { ChannelManager };