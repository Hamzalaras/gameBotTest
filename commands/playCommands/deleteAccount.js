const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { ErrorUnit } = require('../../centralUnits/errorUnit.js');
const { Management } = require('../../dataBase.js');
const { deleteNiggas } = require('../../centralUnits/usefullFuncs.js');

module.exports = {
    name: ['حذف'],
    category: 'player',
    need: true,
    async execute(msg){
        
        let mainMsgObj;
        try {
            const botAvatar = await msg.client.user.displayAvatarURL({ dynamic: true, size: 1024 });
            const mainEmbed = new EmbedBuilder()
                                    .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${botAvatar}`, })
                                    .setTitle(`❌حذف حساب اللاعب ${msg.author.globalName}❌`)
                                    .setDescription('Can\'t do well when I think you\'re gonna leave me\nBut I know I try\nAre you gonna leave us now?');
            const confirmeBtns = 
                [
                    new ButtonBuilder().setCustomId('delete').setLabel('حذف').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId('back').setLabel('تراجع').setStyle(ButtonStyle.Primary),
                ];
            const btnsRow = new ActionRowBuilder().addComponents(confirmeBtns);

            const filter = i => i.user.id === msg.author.id;
            mainMsgObj = await msg.channel.send({ content: `${msg.author}`, embeds: [mainEmbed], components: [btnsRow], });
            const getResponse = await mainMsgObj.awaitMessageComponent({ filter , time: 60_000, });

            if (getResponse.customId === 'تراجع') {
                mainEmbed.setTitle('🥳تم إلغاء الحذف🥳').setDescription('سعداء بتراجعك عن قرارك 😘\nرحلة ممتعة في \*\*بوت الرحمة الكونية\*\* 💓');
                await reply.edit({ content: `${msg.author}`, embeds: [mainEmbed], components: [], });
                return;
            }

            await deleteNiggas(Management, msg.author);
            mainEmbed.setDescription('تم حذفك بنجاح من \*\*بوت الرحمة الكونية\*\* 🥲\nستبقى دائما في القلب أيها الزنجي 😘');
            await reply.edit({ content: `${msg.author}`, embeds: [mainEmbed], components: [], });

            return;
        } catch (error) {
            if ( ( error.code === 'InteractionCollectorError' || error.message.includes('time') ) && mainMsgObj) {
                try {
                    await mainMsgObj.edit(
                        {
                            content: `${msg.author}\nلقد إنتهى الوقت المحدد لهذه العملية ❌\n\
                                    يرجى المحاولة مرة أخرى 😘`,
                            components: []
                        }
                    );
                    return;
                } catch (error) {
                    throw error;
                }
            } 
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`حذف\` 🥲');
            return;
        }
    }
}