const { EmbedBuilder } = require('discord.js');
const { Management } = require('../../dataBase.js');
const characters = require('../../data/character/character.json');

module.exports = {
    name: ['ملفي', 'ملف'],
    path: { 'playCommands': [1, 3] },
    need: true,
    async execute(msg){
        const id = msg.author.id
        const serverAvatar = await msg.guild.iconURL({ dynamic: true, size: 2048});


        const getbasicInfo = await Management.selectManager(['player_name', 'lvl', 'story_position'], 'players', 'player_id', id) ;
        const getcharacterInfo = await Management.selectManager(['character_name', 'attaque', 'deffanse', 'magic', 'physic'], 'players_characters', 'player_id', id);
        const getwelthInfo = await Management.selectManager(['gold', 'diamands', 'coins'], 'players_welth', id) ;//dataBaseManager.getInfo('gold', 'diamands', 'coins', 'players_welth', id);
        const [basicInfo, characterInfo, welthInfo] = [getbasicInfo[0], getcharacterInfo[0], getwelthInfo[0]];
        const characterData = characters.find(c => c.name == characterInfo.character_name);

        const profileEmbed = new EmbedBuilder()
                                 .setTitle(`ملف خاص ب: ${basicInfo.player_name}`)
                                 .setColor('Green')
                                 .setThumbnail(serverAvatar)
                                 .addFields(
                                    { name: `ثروة اللاعب: \n الذهب: ${welthInfo.gold} \n الجواهر: ${welthInfo.diamands} \n العملات: ${welthInfo.coins}`, value:``},
                                    { name: `مستوى الشهوة: ${basicInfo.lvl}`, value:``},
                                    { name: `خصائص شخصية اللاعب: \n اسم الشخصية: ${characterData.name} \n نقاط الهجوم: ${characterData.initialAttack} + ${characterInfo.attaque} \n نقاط الدفاع: ${characterData.initialAttack} + ${characterInfo.attaque} \n نقاط السحر: ${characterData.initialAttack} + ${characterInfo.attaque} \n نقاط الجسم: ${characterData.initialAttack} + ${characterInfo.attaque} \n`, value:``},
                                    { name: `الوضع الحالي: ${basicInfo.current_mode}.`, value:``}
                                 )

        return await msg.channel.send({content: `${msg.author}`, embeds: [profileEmbed]});                         
    }
}
