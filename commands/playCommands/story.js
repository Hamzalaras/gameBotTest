const { ButtonBuilder, ActionRowBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { ErrorUnit } = require('../../centralUnits/errorUnit.js');
const  StoryManager  = require('../../classes/story.js');

module.exports ={
    name: ['تفعيل_قصة', 'تفعيل_قصه'],
    async execute(msg){

        const faceEmbed = new EmbedBuilder()
                              .setTitle('تفعيل_قصة')
                              .setColor('Red')
                              .addField(
                                { name: 'هام:', value: '\*\*يرجى قراءة شرح هذا الأمر عن طريق طباعة الأمر: \`مساعدة\` \`تفعيل_قصة\`\*\*'}
                              )
        const confirmationBTN = new ButtonBuilder()
                                    .setCustomId('confirmation')
                                    .setStyle(ButtonStyle.Danger)
                                    .setLabel('تأكيد')
        const rejectBTN = new ButtonBuilder()
                              .setCustomId('reject')
                              .setStyle(ButtonStyle.Primary)
                              .setLabel('رفض')
        const buttonsRow = new ActionRowBuilder().addComponents(confirmationBTN, rejectBTN);

        try {
            const filter = i => i.user.id === msg.author.id;
            const confirmationMsg = await msg.channel.send({content: `${msg.author}`, embeds: [faceEmbed], components: [buttonsRow]});
            const collector = await confirmationMsg.awaitMessageComponent({ filter , time: 30_000 });
            
            if(collector.customId === 'confirmation'){
                await collector.deferUpdate();
                const storyManager = new StoryManager.StoryManager(msg);
                const departPosition = await storyManager.getPosition();
                return await storyManager.gameHandling(confirmationMsg, collectorFilter, departPosition);
            }else if(collector.customId === 'reject'){
                await collector.deferUpdate();
                await confirmationMsg.edit({content: 'حسحسkwkcdk', components: []});
                return await msg.client.commands.get('مساعدة').execute(msg, msg.client.commands.get('تفعيل_قصة'));
            }
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر: \`تفعيل_قصة\`');
            return;
        }
                              
    }
}