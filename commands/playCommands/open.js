const { EmbedBuilder } = require('discord.js');
const { ErrorUnit, FalseInput, RandomErrors } = require('../../centralUnits/errorUnit.js');
const { Management } = require('../../dataBase.js');
const { chestGenerator } = require('../../centralUnits/usefullFuncs.js');
const chests = require('../../data/chest.json');

module.exports = {
    name: ['فتح_صندوق'],
    path: { 'playCommands': [1, 8]},
    need: true,
    async execute(msg, args){
        try {
            //Check the valid input
            const types = chests.map(t => t.type);
            const chestName = args[1];
            if(!(types.some(t => t === chestName))) throw new FalseInput('فتح_صندوق');

            //Chek if the user have the given chest type and how many
            const getChestInfo = await Management.selectManager(['chest_type', 'chest_num'], 'players_mail_chests', ['player_id', 'chest_type'], [msg.author.id, chestName]);
            if(getChestInfo.length === 0) throw new RandomErrors(`ليس لديكم هذا النوع من الصناديق: ${chestName} 🥲`);

            //Generate the chest and get it s infos
            const chest = chestGenerator(`${chestName}`);
            const [cards, welth] = [chest.cards, chest.welth];

            //Check if the user have the chest s cards to either insert it or update the uses left for each card
            // and update the other tables
            const dispoCheck = [];
            for(const card of cards){
                const row = await Management.selectManager(['card_id', 'uses_left'], 'players_cards', ['player_id', 'card_id'], [msg.author.id, card.id]);
                dispoCheck.push(row);
            }
            for(let i = 0; i < dispoCheck.length; i++){
                if(dispoCheck[i].length === 0){
                    await Management.insertManager(
                        ['player_name', 'player_id', 'card_id', 'uses_left'],
                        'players_cards',
                        [msg.author.globalName, msg.author.id, cards[i].id, cards[i].usesLeft]
                    );
                    const oldUsersNum = (await Management.selectManager(['owners_number'], 'cards', ['card_id'], [cards[i].id]))[0].owners_number;
                    await Management.updateManager(['owners_number'], 'cards', [Number(oldUsersNum) + 1], ['card_id'], [cards[i].id]);
                }else{
                    await Management.updateManager(
                        ['uses_left'],
                        'players_cards',
                        [Number(dispoCheck[i][0].uses_left) + cards[i].usesLeft],
                        ['player_id', 'card_id'], [msg.author.id, dispoCheck[i][0].card_id]
                    );
                }
            }

            //Update the user welth
            for(const type of welth){
                const [name, val] = [Object.keys(type)[0], Object.values(type)[0]];

                const oldVal = (await Management.selectManager([name], 'players_welth', ['player_id'], [msg.author.id]))[0][name];
                await Management.updateManager(
                    [name], 'players_welth', [Number(oldVal) + val], ['player_id'], [msg.author.id]
                );
            }

            //Update the user s chests mail
            const num = Number(getChestInfo[0].chest_num);
            num > 1 ? await Management.updateManager(['chest_num'], 'players_mail_chests', [`${num - 1}`], ['player_id', 'chest_type'], [msg.author.id, chestName]) :
                      await Management.deleteManager('players_mail_chests', ['player_id', 'chest_type'], [msg.author.id, chestName]);

            //Embed and shit          
            const avatar = msg.client.user.displayAvatarURL({ dynamic: true, size: 1024 });
            const resultEmbed = new EmbedBuilder()
                                    .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${avatar}`})
                                    .setColor('Green')
                                    .setTitle(`🎁فتح_صندوق ${chestName}`)
                                    .setDescription(`🥳تم فتح الصندوق ${chestName} بنجاح\n🤩تحصلتم على:`)
                                    .addFields(
                                        cards.map(c => {
                                            return { name: `🃏بطاقة \`\`${c.name}\`\`:`,
                                                       value: `بطاقة من النوع \*\*${c.type}\*\* تنتمي إلى \*\*${c.nature}\*\*.\nمعرفها \*\*${c.id}\*\*.`
                                                   }
                                        })
                                    )
                                    .addFields(
                                        { name: `🪙الثروة:`,
                                            value: `${welth.map(t => `\*\*${Object.values(t)[0]}\*\* قطعة من \*\*${Object.keys(t)[0]}\*\*.\n` )}`
                                        }
                                    )
                                            
            await msg.channel.send({content: `${msg.author}`, embeds: [resultEmbed]});                        
            return;
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`\`فتح_صندوق\`\` 🥲');
            return;
        }
    }
}