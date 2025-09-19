const { EmbedBuilder } = require('discord.js');
const { ErrorUnit } = require('../../centralUnits/errorUnit.js');
const { Management } = require('../../dataBase.js');
const characters = require('../../data/character/character.json');

module.exports = {
    name: ['ملفي', 'ملف'],
    path: { 'playCommands': [1, 3] },
    need: true,
    async execute(msg){
        try {
            const id = msg.author.id
            const serverAvatar = await msg.guild.iconURL({ dynamic: true, size: 2048});

            const [basicInfo, characterInfo, welthInfo] = [
                (await Management.selectManager(['player_name', 'lvl', 'story_position'], 'players', ['player_id'], [id]))[0],
                (await Management.selectManager(['character_name', 'attaque', 'deffanse', 'magic', 'physic'], 'players_characters', ['player_id'], [id]))[0],
                (await Management.selectManager(['gold', 'diamands', 'coins'], 'players_welth', ['player_id'], [id]))[0]
            ]
                    
            const characterData = characters.find(c => c.name == characterInfo.character_name);
            const profileEmbed = new EmbedBuilder()
                                    .setTitle(`ملف خاص ب: ${basicInfo.player_name}`)
                                    .setColor('Green')
                                    .setThumbnail(serverAvatar)
                                    .addFields(
                                        { name: `ثروة اللاعب:`, 
                                            value: `الذهب: \*\*${welthInfo.gold}\*\*\nالجواهر: \*\*${welthInfo.diamands}\*\*\nالعملات: \*\*${welthInfo.coins}\*\*`},
                                        { name: `مستوى الشهوة:`, 
                                            value: `\*\*${basicInfo.lvl}\*\*`},
                                        { name: `خصائص شخصية اللاعب:`,
                                            value: `\nاسم الشخصية: \*\*${characterData.name}\*\*\nنقاط الهجوم: \*\*${characterData.initialAttack}\*\* + \*\*${characterInfo.attaque}\*\*\nنقاط الدفاع: \*\*${characterData.initialDefense}\*\* + \*\*${characterInfo.deffanse}\*\*\nنقاط السحر: \*\*${characterData.initialMagic}\*\* + \*\*${characterInfo.magic}\*\*\nنقاط الجسم: \*\*${characterData.initialPhysic}\*\* + \*\*${characterInfo.physic}\*\*\n`},
                                        { name: `وضع القصة:`, 
                                            value: `\*\*${basicInfo.story_position}\*\*`
                                        }
                                    )

            await msg.channel.send({content: `${msg.author}`, embeds: [profileEmbed]});
            return;
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`ملفي\`');
            return;
        }                  
    }
}
