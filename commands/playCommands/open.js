const { EmbedBuilder } = require('discord.js');
const { ErrorUnit, FalseInput, RandomErrors } = require('../../centralUnits/errorUnit.js');
const { Management } = require('../../dataBase.js');
const { chestGenerator, traduction } = require('../../centralUnits/usefullFuncs.js');
const chestsJson = require('../../data/chest.json');

module.exports = {
    name: ['فتح_صندوق'],
    category: 'player',
    need: true,
    async execute(msg, args){
        try {
            //Check the valid input
            const chestTypes = chestsJson.map(obj => obj.type);
            const wantedType = args[1];
            if ( !( chestTypes.includes(wantedType) ) ) {
                throw new FalseInput('فتح_صندوق');
            }

            //Chek if the user have the given chest type and how many
            const userChestInfo = ( await Management.selectManager(
                                            ['chest_type', 'chest_num'],
                                            'players_mail_chests',
                                            ['player_id', 'chest_type'],
                                            [msg.author.id, wantedType]
                                        )
                                    )[0];

            if (!userChestInfo) {
                throw new RandomErrors(`ليس لديكم هذا النوع من الصناديق: ${wantedType} 🥲`);
            }

            //Generate the chest and get it s infos
            const chest = chestGenerator(wantedType);
            const [cards, welth] = [chest.cards, chest.welth];

            //Check if the user have the chest s cards to either insert it or update the uses left for each card
            // and update the other tables
            
            const userCardsSts = await Promise.all(
                                    cards.map( card => {
                                            return  Management.selectManager(
                                                            ['card_id', 'uses_left'],
                                                            'players_cards',
                                                            ['player_id', 'card_id'],
                                                            [msg.author.id, card.id]
                                                        );
                                        }
                                    ),
                                ).forEach( (item, index, arr) => arr[index] = item.length ? item : null )
                                 .flat();

            for (let cardIndx = 0; cardIndx < userCardsSts.length; cardIndx++) {

                if ( !userCardsSts[cardIndx] ) {
                    await Management.insertManager(
                        ['player_name', 'player_id', 'card_id', 'uses_left'],
                        'players_cards',
                        [msg.author.globalName, msg.author.id, cards[cardIndx].id, cards[cardIndx].usesLeft]
                    );

                    const cardUsersNbr = ( await Management.selectManager(
                                                    ['owners_number'],
                                                    'cards', 
                                                    ['card_id'], 
                                                    [cards[cardIndx].id]
                                                )
                                            )[0].owners_number;
                    await Management.updateManager(
                            ['owners_number'],
                            'cards', 
                            [`${+cardUsersNbr + 1}`], 
                            ['card_id'], 
                            [cards[cardIndx].id]
                        );
                } else {
                    const newUsesLeft = +(userCardsSts[cardIndx].uses_left) + cards[cardIndx].usesLeft;
                    await Management.updateManager(
                        ['uses_left'],
                        'players_cards',
                        [newUsesLeft],
                        ['player_id', 'card_id'],
                        [msg.author.id, userCardsSts[cardIndx].id]
                    );
                }

            }

            //Update the user welth
            const [welthTypes, amountToAdd] = [ Object.keys(welth), Object.values(welth) ]; 
            const oldAmount = ( await Management.selectManager(
                                        [...welthTypes],
                                        'players_welth',
                                        ['player_id'],
                                        [msg.author.id]
                                    ) 
                                )[0];

            const newAmount = Object.values(oldAmount).map( (amount, position) => `${+amount + +amountToAdd[position]}` );
            await Management.updateManager(
                    [...welthTypes],
                    'players_welth',
                    [...newAmount],
                    ['player_id'],
                    [msg.author.id]
            )

            //Update the user s chests mail
            if (userChestInfo.chest_num > 1) {
                await Management.updateManager(
                        ['chest_num'],
                        'players_mail_chests',
                        [`${userChestInfo.chest_num - 1}`],
                        ['player_id', 'chest_type'],
                        [msg.author.id, wantedType]
                )
            } else {
                await Management.deleteManager(
                    'players_mail_chests',
                    ['player_id', 'chest_type'],
                    [msg.author.id, wantedType]
                )
            }

            //Embed and shit
            const field = 
                [
                    cards.map(card => {
                                return {
                                    name: `🃏بطاقة \`\`${card.name}\`\`:`,
                                    value: `بطاقة من النوع \*\*${card.type}\*\*\
                                            تنتمي إلى \*\*${card.nature}\*\* .\n\
                                            معرفها \*\*${card.id}\*\* .`

                                }
                            }
                        ),
                    Object.entries(welth).map( ([type, amount]) => {
                                const arabWord = traduction(type);
                                return {
                                    name: `🪙ال${arabWord}:`,
                                    value: `--\*\*${amount}\*\* قطعة من ال\*\*${arabWord}\*\* .`
                                }
                            }
                        )    
                ].flat();
            

            const botAvatar = msg.client.user.displayAvatarURL({ dynamic: true, size: 1024, });
            const mainEmbed = new EmbedBuilder()
                                    .setAuthor({ name: `${msg.client.user.username}`, iconURL: `${botAvatar}`, })
                                    .setColor('Green')
                                    .setTitle(`🎁فتح_صندوق ${wantedType}`)
                                    .setDescription(`🥳تم فتح الصندوق ${wantedType} بنجاح\n🤩تحصلتم على:`)
                                    .addFields(field)
                                            
            await msg.channel.send({ content: `${msg.author}`, embeds: [mainEmbed] });     

            return;
        } catch (error) {
            await ErrorUnit.throwError(error, msg, 'حدث خطأ أثناء تنفيذ الأمر \`\`فتح_صندوق\`\` 🥲');
            return;
        }
    }
}