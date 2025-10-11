const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { ErrorUnit } = require('../../centralUnits/errorUnit.js');
const { Management } = require('../../dataBase.js');
const { deleteNiggas } = require('../../centralUnits/usefullFuncs.js');

module.exports = {
    name: ['حذف'],
    path: { 'playCommands': [1, 9]},
    need: true,
    async execute(msg){
        try {
            const avatar = await msg.client.user.displayAvatarURL({ dynamic: true, size: 1024 });
            const deleteEmbed = new EmbedBuilder()
                                    .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${avatar}`})
                                    .setTitle(`❌حذف حساب اللاعب ${msg.author.globalname}❌`)
                                    .setDescription('Can\′t do well when I think you\'re gonna leave me\nBut I know I try\nAre you gonna leave us now?');
            const buttons = [
                new ButtonBuilder().setCustomId('delete').setLabel('حذف').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('back').setLabel('تراجع').setStyle(ButtonStyle.Primary),
            ];
            const btnRow = new ActionRowBuilder().addComponents(buttons);

            const filter = i => i.user.id === msg.author.id;
            const reply = await msg.channel.send({content: `${msg.author}`, embeds: [deleteEmbed], components: [btnRow]});
            const collector = await reply.awaitMessageComponent({ filter , time: 60_000 });

            if(collector.customId === 'تراجع'){
                deleteEmbed.setTitle('🥳تم إلغاء الحذف🥳').setDescription('سعداء بتراجعك عن قرارك 😘\nرحلة ممتعة في \*\*بوت الرحمة الكونية\*\* 💓');
                await reply.edit({content: `${msg.author}`, embeds: [deleteEmbed], components: []});
                return;
            }

            await deleteNiggas(Management, msg.author);
            deleteEmbed.setDescription('تم حذفك بنجاح من \*\*بوت الرحمة الكونية\*\* 🥲\nستبقى دائما في القلب أيها الزنجي 😘');
            await reply.edit({content: `${msg.author}`, embeds: [deleteEmbed], components: []});
            return;

        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`حذف\` 🥲');
            return;
        }
    }
}