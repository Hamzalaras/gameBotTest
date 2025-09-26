const { EmbedBuilder } = require('discord.js');
const { ErrorUnit, RandomErrors } = require('../../centralUnits/errorUnit.js');
const { Management } = require('../../dataBase.js');
const { getLvl } = require('../../centralUnits/usefullFuncs.js');
const characters = require('../../data/character/character.json');

module.exports = {
    name: ['ملفي', 'ملف'],
    path: { 'playCommands': [1, 3] },
    need: true,
    async execute(msg){
        try {
            //Get infos and shit
            const id = msg.author.id
            const [basicInfo, characterInfo, welthInfo] = [
                (await Management.selectManager(['player_name', 'xp', 'story_position'], 'players', ['player_id'], [id]))[0],
                (await Management.selectManager(['character_name', 'attaque', 'deffanse', 'magic', 'physic'], 'players_characters', ['player_id'], [id]))[0],
                (await Management.selectManager(['gold', 'daimands', 'coins'], 'players_welth', ['player_id'], [id]))[0]
            ];
            const lvl = getLvl(Number(basicInfo.xp)); //Calculate the lvl
            const characterData = characters.find(c => c.name == characterInfo.character_name);
            if(!characterData) throw new RandomErrors('حدث خطأ أثناء البحث عن المعلومات يرجى المحاولة لاحقا 🥲');

            //Embed and shit 
            const avatar = msg.client.user.displayAvatarURL({ dynamic: true, size: 1024 });
            const profileEmbed = new EmbedBuilder()
                                    .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${avatar}`})
                                    .setTitle(`🕹️ملف خاص باللاعب: ${basicInfo.player_name}`)
                                    .setColor('Green')
                                    .addFields(
                                        { name: `🪙ثروة اللاعب:`, 
                                            value: `الذهب: \*\*${welthInfo.gold} .\*\*\nالجواهر: \*\*${welthInfo.daimands} .\*\*\nالعملات: \*\*${welthInfo.coins}\*\* .`},
                                        { name: `🥵مستوى الشهوة:`, 
                                            value: `المستوى \*\*${lvl.lvl}\*\* و \*\*${lvl.xp}\*\* xp .`},
                                        { name: `😶‍🌫️خصائص شخصية اللاعب:`,
                                            value: `\nاسم الشخصية: \*\*${characterData.name}\*\* .\nنقاط الهجوم: \*\*${characterData.initialAttack}\*\* + \*\*${characterInfo.attaque}\*\* .\nنقاط الدفاع: \*\*${characterData.initialDefense}\*\* + \*\*${characterInfo.deffanse}\*\* .\nنقاط السحر: \*\*${characterData.initialMagic}\*\* + \*\*${characterInfo.magic}\*\* .\nنقاط الجسم: \*\*${characterData.initialPhysic}\*\* + \*\*${characterInfo.physic}\*\* .\n`},
                                        { name: `🌌وضع القصة:`, 
                                            value: `أنت في الجزء: \*\*${basicInfo.story_position}\*\* .`
                                        }
                                    )

            await msg.channel.send({content: `${msg.author}`, embeds: [profileEmbed]});
            return;
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`ملفي\` 🥲');
            return;
        }                  
    }
}
