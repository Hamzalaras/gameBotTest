const { EmbedBuilder } = require('discord.js');
const { ErrorUnit, FalseInput, RandomErrors } = require('../../centralUnits/errorUnit.js');
const { Management } = require('../../dataBase.js');
const { pointsCollector, chestGenerator } = require('../../centralUnits/usefullFuncs.js');
const cardsJSON = require('../../data/cards/cards.json');

module.exports = {
    name: ['هاجم', 'هجوم', 'مهاجمة', 'مهاجمه'],
    category: 'player',
    need: true,
    async execute(msg, args) {
        try {
            //Check if the mention is a real user, != msg.author, one mention and if the user mentioned is a player
            const targetUser = msg.mentions.users.first();
            if (!targetUser ||
                msg.mentions.users.size !== 1 ||
                targetUser.id !== args[1]?.match(/\d+/)?.[0] ||
                targetUser.id === msg.author.id) {
                    throw new FalseInput('هاجم');
            }
            const isPlayer = await Management.selectManager(['player_name'], 'players', ['player_id'], [targetUser.id]);
            if (!isPlayer.length) {
                throw new RandomErrors(`${targetUser} ليس مسجل كلاعب أصلا!!`);
            }

            //Get the defence deck of the mentioned user and the attaque deck of the msg.author 
            const getDefenceDeck = ( await Management.selectManager(
                                        ['first_card', 'second_card', 'third_card'],
                                        'players_team_defence',
                                        ['player_id'], [targetUser.id]
                                      )
                                    )[0];
            if(!getDefenceDeck) {
                throw new RandomErrors(`اللاعب: ${targetUser} لا يملك تشكيلة دفاع!!`);
            }

            const getAttaqueDeck = ( await Management.selectManager(
                                            ['first_card', 'second_card', 'third_card'],
                                            'players_team_attack',
                                            ['player_id'], [msg.author.id]  
                                      )
                                    )[0]
            if(!getAttaqueDeck) {
                throw new RandomErrors('أنت لا تملك تشكيلة هجوم!!');
            }

            //Check if the cards r still in cardsJson data
            const [attaqueDeckIds, defenceDeckIds] = 
                [   
                    Object.values(getAttaqueDeck), 
                    Object.values(getDefenceDeck)
                ];

            const cards = cardsJSON.flatMap(type => type.cards);
            const [attaqueDeck, defenceDeck] = 
                    [attaqueDeckIds, defenceDeckIds].map(type => {
                                                    return type.map( id => cards.find(card => card.id === id) );
                                                }
                                            );

            //Get the power points of each deck to set the winner and loser
            const [attaquePoints, defencePoints] = 
                [
                    pointsCollector(attaqueDeck, 'attaque'),
                    pointsCollector(defenceDeck, 'defence')
                ];
            const [winner, loser] = attaquePoints > defencePoints ?
                                   [msg.author, targetUser] : [targetUser, msg.author];

            //Get a random chest, some xp points as a prize
            const chest =  chestGenerator(); 
            const xpPoints = Math.floor(Math.random() * 100);
            const [winnerOldXp, loserOldXp] = 
                [
                    +( ( await Management.selectManager(['xp'], 'players', ['player_id'], [winner.id]) )[0]?.xp),
                    +( ( await Management.selectManager(['xp'], 'players', ['player_id'], [loser.id]) )[0]?.xp)
                ];

            //Save the prizes
            const numberOfChests = +( (await Management.selectManager(
                                                ['chest_num'], 
                                                'players_mail_chests', 
                                                ['player_id', 'chest_type'],
                                                [winner.id, chest.type]
                                            )
                                        )[0]?.chest_num
                                    );
            numberOfChests ? 
                await Management.updateManager(
                    ['chest_num'], 
                    'players_mail_chests', 
                    [`${numberOfChests + 1}`], 
                    ['player_id', 'chest_type'], 
                    [winner.id, chest.type]
                ) :
                await Management.insertManager(
                    ['player_name', 'player_id', 'chest_type', 'chest_num'],
                    'players_mail_chests',
                    [winner.globalName, winner.id, chest.type, '1']
                );

            const [winnerNewXp, loserNewXp] = 
                [
                    `${winnerOldXp + xpPoints}`,
                    loserOldXp < xpPoints ? '0' : `${loserOldXp - xpPoints}`
                ];    
            await Management.updateManager(
                                            ['xp'], 
                                            'players', 
                                            [winnerNewXp], 
                                            ['player_id'], 
                                            [winner.id]
                                        );
            await Management.updateManager(
                                            ['xp'], 
                                            'players', 
                                            [loserNewXp], 
                                            ['player_id'], 
                                            [loser.id]
                                        );

            //Embed and shit 
            const avatar = msg.client.user.displayAvatarURL({ dynamic: true, size: 1024 });
            const resultEmbed = new EmbedBuilder()
                                 .setColor('Green')
                                 .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${avatar}`})
                                 .setTitle('⚔️نتيجة الهجوم⚔️')
                                 .setDescription(`❗قام اللاعب: ${msg.author} بمهاجمة اللاعب: ${targetUser}`)
                                 .addFields(
                                    { name: `🃏تشكيلة الهجوم الخاصة باللاعب ${msg.author.globalName} :`,
                                        value: `${attaqueDeck.map(c => `\`\`${c.name}\`\``).join(' -- ')}\nمجموع قوة البطاقات: \*\*${attaquePoints}\*\* نقطة .`
                                    },
                                    { name: `🃏تشكيلة الدفاع الخاصة باللاعب ${targetUser.globalName} :`,
                                        value: `${defenceDeck.map(c => `\`\`${c.name}\`\``).join(' -- ')}\nمجموع قوة البطاقات: \*\*${defencePoints}\*\* نقطة .`
                                    },
                                    { name : `🥇الفائز:`,
                                        value: `${winner}`
                                    },
                                    { name : `🏆جوائز الفائز:`,
                                        value: `🎁صندوق من النوع \*\*${chest.type}\*\* .\n🟠\*\*${xpPoints}\*\* نقطة xp .`
                                    },
                                    { name: `💩الخاسر:`,
                                        value: `${loser}\n🟠تم خصم \*\*${xpPoints}\*\* نقطة xp .`
                                    },
                                 );
            await msg.channel.send({ constent: `${msg.author}`, embeds: [resultEmbed], }); 
            await targetUser.send({ conetent: `${targetUser}`, embeds: [resultEmbed], });    

            return;
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`\`هاجم\`\` 🥲');
            return;
        }
    }
}