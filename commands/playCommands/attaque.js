const { EmbedBuilder } = require('discord.js');
const { ErrorUnit, FalseInput, RandomErrors } = require('../../centralUnits/errorUnit.js');
const { Management } = require('../../dataBase.js');
const { pointsCollector, chestGenerator } = require('../../centralUnits/usefullFuncs.js');
const cardsJSON = require('../../data/cards/cards.json');

module.exports = {
    name: ['هاجم', 'هجوم', 'مهاجمة', 'مهاجمه'],
    path: { 'playCommands': [1, 6]},
    need: true,
    async execute(msg, args){
        try {
            //Check if the mention is a real user, != msg.author, one mention and if the user mentioned is a player
            const user = msg.mentions.users.first();
            if(!user || msg.mentions.users.size !== 1 || user.id !== args[1]?.match(/\d+/)?.[0] || user.id == msg.author.id) throw new FalseInput('هاجم');
            const isIt = await Management.selectManager(['player_name'], 'players', ['player_id'], [user.id]);
            if(isIt.length === 0) throw new RandomErrors(`${user} ليس مسجل كلاعب أصلا!!`);

            //Get the defence deck of the mentioned user and the attaque deck of the msg.author 
            const getDefenceCards = await Management.selectManager(
                ['first_card', 'second_card', 'third_card'],
                'players_team_دفاع',
                ['player_id'], [user.id]
            );
            if(getDefenceCards.length === 0) throw new RandomErrors(`اللاعب: ${user} لا يملك تشكيلة دفاع!!`);

            const getAttaqueCards = await Management.selectManager(
                ['first_card', 'second_card', 'third_card'],
                'players_team_هجوم',
                ['player_id'], [msg.author.id]  
            );
            if(getAttaqueCards.length === 0) throw new RandomErrors('أنت لا تملك تشكيلة هجوم!!');

            //Check if the cards r still in cardsJson data
            const [attaqueCards, defenceCrads] = [Object.values(getAttaqueCards[0]), Object.values(getDefenceCards[0])];

            const cards = cardsJSON.flatMap(type => type.cards);
            const [attaqueDeck, defenceDeck] = [attaqueCards, defenceCrads].map(type =>{
                return type.map(v => isNaN(v) ? cards.find(c => c.name === v) : cards[v - 1]);
            });

            //Get the power points of each deck to set the winner and loser
            const attaquePoints = pointsCollector(attaqueDeck, 'attaque');
            const defencePoints = pointsCollector(defenceDeck, 'defence');
            const [winner, loser] = attaquePoints > defencePoints ?
                                   [msg.author, user] : [user, msg.author] ;

            //Get a random chest, some xp points as a prize
            const chest =  chestGenerator(); 
            const xpPoints = Math.floor(Math.random() * 100);

            //Save the prizes
            const num = (await Management.selectManager(['chest_num'], 'players_mail_chests', ['player_id', 'chest_type'], [winner.id, chest.type]))?.[0]?.chest_num;
            num ? 
                await Management.updateManager(['chest_num'], 'players_mail_chests', [`${Number(num) + 1}`], ['player_id', 'chest_type'], [winner.id, chest.type]) :
                await Management.insertManager(
                    ['player_name', 'player_id', 'chest_type', 'chest_num'],
                    'players_mail_chests',
                    [winner.globalName, winner.id, chest.type, '1']
                );
            const [winnerOldXp, loserOldXp] = [
                (await Management.selectManager(['xp'], 'players', ['player_id'], [winner.id]))[0].xp,
                (await Management.selectManager(['xp'], 'players', ['player_id'], [loser.id]))[0].xp
            ];

            await Management.updateManager(['xp'], 'players', [`${Number(winnerOldXp) + xpPoints}`], ['player_id'], [winner.id]);
            if(Number(loserOldXp) < xpPoints) await Management.updateManager(['xp'], 'players', ['0'], ['player_id'], [loser.id]);

            //Embed and shit 
            const avatar = msg.client.user.displayAvatarURL({ dynamic: true, size: 1024 });
            const resultEmbed = new EmbedBuilder()
                                 .setColor('Green')
                                 .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${avatar}`})
                                 .setTitle('⚔️نتيجة الهجوم⚔️')
                                 .setDescription(`❗قام اللاعب: ${msg.author} بمهاجمة اللاعب: ${user}`)
                                 .addFields(
                                    { name: `🃏تشكيلة الهجوم الخاصة باللاعب ${msg.author} :`,
                                        value: `${attaqueDeck.map(c => `\`\`${c.name}\`\``).join(' -- ')}\nمجموع قوة البطاقات: \*\*${attaquePoints}\*\* نقطة .`
                                    },
                                    { name: `🃏تشكيلة الدفاع الخاصة باللاعب ${user} :`,
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
                                    }
                                 );
            await msg.channel.send({constent: `${msg.author}`, embeds: [resultEmbed]}); 
            await user.send({conetent: `${user}`, embeds: [resultEmbed]});                    
            return;

        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`\`هاجم\`\` 🥲');
            return;
        }
    }
}