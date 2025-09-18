const { ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { ErrorUnit } = require('../../centralUnits/errorUnit.js');
const { Management } = require('../../dataBase.js');
const { gameHandling } = require('../../centralUnits/usefullFuncs.js');

module.exports ={
    name: ['تفعيل_قصة', 'تفعيل_قصه'],
    path: { 'playCommands': [1, 2] },
    need: true,
    async execute(msg){

        const faceEmbed = new EmbedBuilder()
                              .setTitle('تفعيل_قصة')
                              .setColor('Red')
                              .addFields(
                                { name: 'هام:', value: '\*\*يرجى قراءة شرح هذا الأمر عن طريق طباعة الأمر: \`مساعدة\` \`تفعيل_قصة\`\*\*'}
                              );
        const buttons = [
                         new ButtonBuilder().setCustomId('confirmation').setLabel('تأكيد').setStyle(ButtonStyle.Danger),
                         new ButtonBuilder().setCustomId('reject').setLabel('رفض').setStyle(ButtonStyle.Primary)
                        ]                      
                                           
        const buttonsRow = new ActionRowBuilder().addComponents(buttons);

        try {
            const filter = i => i.user.id === msg.author.id;
            const confirmationMsg = await msg.channel.send({content: `${msg.author}`, embeds: [faceEmbed], components: [buttonsRow]});
            const collector = await confirmationMsg.awaitMessageComponent({ filter , time: 60_000 });
            
            if(collector.customId === 'confirmation'){
                await collector.deferUpdate();
                await confirmationMsg.edit({embeds: []});
                await gameHandling(Management, msg, confirmationMsg, filter);
                return;
            }else if(collector.customId === 'reject'){
                await collector.deferUpdate();
                await confirmationMsg.edit({content: `${msg.author}\nيرجى الإطلاع على قائمة الأوامر أسفله 😘`, embeds: [], components: []});
                await msg.client.commands.get('أوامر').execute(msg);
                return;
            }
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر: \`تفعيل_قصة\`');
            return;
        }
                              
    }
}