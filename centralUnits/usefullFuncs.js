const { ButtonBuilder, ActionRowBuilder, ButtonStyle, ModalBuilder, TextInputBuilder } = require('discord.js');
const { ErrorUnit } = require('./errorUnit.js');
const path = require('path');
const cardsJson = require('../data/cards/cards.json');
const story = require('../data/story/firstPort/firstPort.json');
const consequences = require('../data/story/firstPort/consequences.json');

function random(array){
    return array[Math.floor(Math.random() * array.length)];
}

const quiteBTN = [new ButtonBuilder()
                     .setCustomId('تعطيل')
                     .setLabel('تعطيل')
                     .setStyle(ButtonStyle.Secondary)];

async function gameHandling(Management, msg, confirmationMsg, filter, advanture = false){

    //if(!advanture) {}
    let position = (await Management.selectManager(['story_position'], 'players', ['player_id'], [msg.author.id]))[0].story_position;
    let buttons = [];
    try {
        
        let currentFrame = 0;
        let wichSubHistory = false;
        let pass = false; // switch over consequence and main story line !!IMPORTANT!!

        while(true){

            const data = pass && wichSubHistory ? 
                         consequences.find(c => c.id === wichSubHistory.consequence).frames[currentFrame] :
                         story.sequences.find(s => s.position === position) ;
            if(!data){
                await ErrorUnit.throwError(false, msg, 'لم يتم العثور على موقعكم الحالي في القصة!!\nحاول لاحقا ');
                return;
            }                
            
            const photo = data.photo ? 
                          [path.join(__dirname, '..', 'data', 'story', 'firstPort', 'images', data.photo)] :
                          [] ;
            const content = `${msg.author} \n` + data.racontreur.map(obj =>{
                                const raconteur = Object.keys(obj)[0];
                                return `${raconteur}: ${obj[raconteur]}`
                            }).join('\n');    
                            
            buttons = data.subHistory.map(obj => {
                return  new ButtonBuilder()
                        .setCustomId(`${obj.button}`)
                        .setLabel(`${obj.button}`)
                        .setStyle(obj.buttonStyle)
            }).concat(quiteBTN);
            const row = new ActionRowBuilder().addComponents(buttons);

            await confirmationMsg.edit({content: `${content}`, files: photo, components: [row]});
            const collector = await confirmationMsg.awaitMessageComponent({ filter, time: 30_000 });
            if(collector.customId === 'تعطيل'){
                await collector.deferUpdate();
                await Management.updateManager(['story_position'], 'players', [position], 'player_id', msg.author.id);
                await confirmationMsg.edit({content: `${msg.author}\nتم حفظ تقدمك بنجاح 😘`});
                return;
            }
            await collector.deferUpdate();
            wichSubHistory =  data.subHistory.find(obj => obj.button === collector.customId);
            if(!wichSubHistory){
                await new ErrorUnit.throwError(false, msg, 'حدث خطأ أثناء البحث عن الصفحة التالية 🥲\n يرجى المحاولة لاحقا 😘');
                return;
            }

            if(!wichSubHistory.followUp){ 
                position++;
                con = false;
            }else if(wichSubHistory.followUp && wichSubHistory.consequence){
                if(con) currentFrame++;
                con = true;
            }
        }
        
    } catch (error) {

        if (error.code === 'InteractionCollectorError' || error.message.includes('time')){
            try {
                await Management.insertManager(['story_position'], 'players', [position]);
                buttons.forEach(b => b.setDisabled(true));
                await confirmationMsg.edit({content: `${msg.author}\nلقد إنتهى الوقت المحدد ❌\nلقد تم حفظ تقدمكم بنجاح 😘`});
                return;
            } catch (error) {
                await ErrorUnit.throwError(false, msg, 'حدث خطأ أثناء محاولة حفظ تقدمكم!!\nسيتم اصلاح الخطأ في أقرب وقت');
                return;
            }
        } else {
            throw error;
        }

    }
} 

function count(arr){
    let final = {};
    for(val of arr){
        final[val] = (final[val] || 0) + 1;
    };
    return final;
}

function pointsCollector(deck, typeOfDeck){
    try {
        let points  = 10;
        const [nature, type] = [[], []];

        deck.forEach(ele =>{
            points += ele.power;
            ele.type === 'both' ? type.push(typeOfDeck) : type.push(ele.type);
            nature.push(ele.nature);
        });
        
        const [countType, countNature] = [count(type), count(nature)];

        Object.values(countNature).filter(v => v == 0).forEach(zero => points -= 5); 

        points += (countType[typeOfDeck] * points) || 0;

        return points;
    } catch (error) {
        throw error;
    }
}

const info = {
    'عام': {
        cards: [{'عامة': 2}],
        welth: [{'gold': 100}, {'daimands': 5}],
        rate: 60
    },
    'نادر': {
        cards: [{'عامة': 5}, {'نادرة': 2}],
        welth: [{'gold': 200}, {'daimands': 10}],
        rate: 25
    },
    'واعر': {
        cards: [{'عامة': 8}, {'نادرة': 5}, {'أسطورية': 1}],
        welth: [{'gold': 300}, {'daimands': 15}],
        rate: 10
    },
    'هارب': {
        cards: [{'عامة': 15}, {'نادرة': 10}, {'أسطورية': 4}],
        welth: [{'gold': 700}, {'daimands': 40}, {'coins': 10}],
        rate: 5
    }
}

function chestGenerator(type = false){
    try {
        let [chest, chances] = [undefined, 0];

        const rand = Math.random() * 100;
        if(type){
            chest = {type, ...info[type]};
        }else{
            for(const [type, data] of Object.entries(info)){
                chances += data.rate;
                if(random < chances){
                    chest = {type, ...data};
                    break;
                }
            }
        }
        if(!chest) throw new Error('خطأ');

        const cards = chest.cards.map(type => {
            const [typeName, num, collected] = [Object.keys(type)[0], Object.values(type)[0], []];

            for(let i = 0; i < num; i++){
                const card = random(cardsJson.find(v => v.value === typeName).cards);
                collected.some(c => c.id === card.id) ? i-- : collected.push(card);
            };
            return collected;
        }).flat();
        chest.cards = cards;

        return chest;
    } catch (error) {
        throw error;
    }
}
chestGenerator('عام');


module.exports = { random, gameHandling, count, pointsCollector, chestGenerator };