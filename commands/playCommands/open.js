const { EmbedBuilder } = require('discord.js');
const { ErrorUnit, FalseInput } = require('../../centralUnits/errorUnit.js');
const { Management } = require('../../dataBase.js');
const { chestGenerator } = require('../../centralUnits/usefullFuncs.js');

module.exports = {
    name: ['فتح_صندوق'],
    path: { 'playCommands': [1, 8]},
    need: true,
    async execute(msg, args){
        try {
            const chestName = args[1];
            if(!(['عام', 'نادر', 'واعر', 'هارب'].some(i => i === chestName))) throw new FalseInput('فتح_صندوق');

            const getChestInfo = await Management.selectManager(['chest_type', 'chest_num'], 'players_mail_chests', ['player_id', 'chest_type'], ['959061410514632734', chestName]);

            console.log(getChestInfo);
            if(getChestInfo.length === 0){
                await ErrorUnit.throwError(false, msg, `ليس لديكم هذا النوع من الصناديق: ${chestName}`);
                return;
            };

            const chest = chestGenerator(`${chestName}`);
            const [cards, welth] = [chest.cards, chest.welth];

            const dispoCheck = [];
            for(const card of cards){
                const row = await Management.selectManager(['card_id', 'uses_left'], 'players_cards', ['player_id', 'card_id'], [msg.author.id, card.id]);
                dispoCheck.push(row);
            }
            for(let i = 0; i < dispoCheck.length; i++){
                dispoCheck[i].length === 0 ?
                    await Management.insertManager(
                        ['player_name', 'player_id', 'card_id', 'uses_left'],
                        'players_cards',
                        [msg.author.globalName, msg.author.id, cards[i].id, cards[i].usesLeft]
                    ) :
                    await Management.updateManager(
                        ['uses_left'], 
                        'players_cards', 
                        [Number(dispoCheck[i][0].uses_left) + cards[i].usesLeft],
                        ['player_id', 'card_id'], [msg.author.id, dispoCheck[i][0].card_id]
                    ) ;    
            }

            for(const type of welth){
                const [name, val] = [Object.keys(type)[0], Object.values(type)[0]];

                const oldVal = (await Management.selectManager([name], 'players_welth', ['player_id'], [msg.author.id]))[0][name];
                await Management.updateManager(
                    [name], 'players_welth', [Number(oldVal) + val], ['player_id'], [msg.author.id]
                );
            }


            const num = Number(getChestInfo[0].chest_num);
            num > 1 ? await Management.updateManager(['chest_num'], 'players_mail_chests', [`${num - 1}`], ['player_id', 'chest_type'], [msg.author.id, chestName]) :
                      await Management.deleteManager('players_mail_chests', ['player_id', 'chest_type'], [msg.author.id, chestName]);

            const resultEmbed = new EmbedBuilder()
                                    .setTitle(`فتح_صندوق ${chestName}`)
                                    .setDescription(`تم فتح الصندوق ${chestName} بنجاح\nتحصلتم على:`)
                                    .addFields(
                                        cards.map(c => {
                                            return { name: `بطاقة \`\`${c.name}\`\`:`,
                                                       value: `بطاقة من النوع \*\*${c.type}\*\* تنتمي إلى \*\*${c.nature}\*\*.\nمعرفها \*\*${c.id}\*\*.`
                                                   }
                                        })
                                    )
                                    .addFields(
                                        { name: `الثروة:`,
                                            value: `${welth.map(t => `\*\*${Object.values(t)[0]}\*\* قطعة من \*\*${Object.keys(t)[0]}\*\*.\n` )}`
                                        }
                                    )
                                            
            await msg.channel.send({content: `${msg.author}`, embeds: [resultEmbed]});                        
            return;
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`\`فتح_صندوق\`\`');
            return;
        }
    }
}