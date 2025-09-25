const { ButtonBuilder, ActionRowBuilder, ButtonStyle, ModalBuilder, TextInputBuilder } = require('discord.js');
const { RandomErrors } = require('./errorUnit.js');
const path = require('path');
const chests = require('../data/chest.json'); 
const cardsJson = require('../data/cards/cards.json');
const story = require('../data/story/firstPort/firstPort.json');
const consequences = require('../data/story/firstPort/consequences.json');

//Reusbale items goes here
const quiteBTN = [new ButtonBuilder()
                     .setCustomId('تعطيل')
                     .setLabel('تعطيل')
                     .setStyle(ButtonStyle.Secondary)];

//Random item from a given array
function random(array){
    return array[Math.floor(Math.random() * array.length)];
}

//Displaying story content
async function gameHandling(Management, msg, confirmationMsg, filter, advanture = false){

    //if(!advanture) {}
    //Every var that will be used in catch goes here

    let position = (await Management.selectManager(['story_position'], 'players', ['player_id'], [msg.author.id]))[0].story_position;    //Get the user position, Only from the main story !!CONSEQUENCE NOT ENCLUDED
    let buttons = [];
    let xp = 0;
    
    try {

        let currentFrame = 0; //Frames of consequences
        let wichSubHistory = false; //Hold the next sequence or frame
        let pass = false; //Switch over consequence and main story firstPort !!IMPORTANT!!

        //While loop with always true condition so the inly way to get out is by return, throw, break keyWords
        while(true){

            //Get the data from the firstPort or consequences based on pass val && wishSubHistory val
            const data = pass && wichSubHistory ? 
                         consequences.find(c => c.id === wichSubHistory.consequence).frames[currentFrame] :
                         story.sequences.find(s => s.position === position) ;
            if(!data) throw new RandomErrors(`يتعذر العثور على موقعكم الحالي في القصة 🥲\nيرجى المحاولة لاحقا 😘`);         
            
            //Get the photo path if exist
            const photo = data.photo ? 
                          [path.join(__dirname, '..', 'data', 'story', 'firstPort', 'images', data.photo)] :
                          [] ;

            //Get the narrator s parole            
            const content = `${msg.author} \n` + data.racontreur.map(obj =>{
                                const raconteur = Object.keys(obj)[0];
                                return `${raconteur}: ${obj[raconteur]}`
                            }).join('\n');    
                            
            //Get the buttons choices and add the quitte btn, limit is five buttons so be carefull                
            buttons = data.subHistory.map(obj => {
                return  new ButtonBuilder()
                        .setCustomId(`${obj.button}`) //Making custom id same as label to make it easy later for searching
                        .setLabel(`${obj.button}`)
                        .setStyle(obj.buttonStyle)
            }).concat(quiteBTN);
            const row = new ActionRowBuilder().addComponents(buttons);

            //Sending the story and waiting for btn interaction
            await confirmationMsg.edit({content: `${content}`, files: photo, components: [row]});
            const collector = await confirmationMsg.awaitMessageComponent({ filter, time: 30_000 });

            if(collector.customId === 'تعطيل'){
                await collector.deferUpdate();
                const oldXp = (await Management.selectManager(['xp'], 'players', ['player_id'], [msg.author.id]))[0].xp;
                await Management.updateManager(['story_position', 'xp'], 'players', [position, `${Number(oldXp) + xp}`], ['player_id'], [msg.author.id]);
                await confirmationMsg.edit({content: `${msg.author}\nتم حفظ تقدمك بنجاح 😘`});
                return;
            }

            //For each button clicked the user get + 10 xp, no matter the choice
            xp += 10;
            await collector.deferUpdate();
            wichSubHistory =  data.subHistory.find(obj => obj.button === collector.customId); //Get the nest page infos
            if(!wichSubHistory) throw new RandomErrors('حدث خطأ أثناء البحث عن الصفحة التالية 🥲\n يرجى المحاولة لاحقا 😘');

            //-followUp- means if the sequence have a consequence
            if(!wichSubHistory.followUp){ 
                position++;
                pass = false;
            }else if(wichSubHistory.followUp && wichSubHistory.consequence){
                //If pass was false that means were gonna start from the first frame cuz currentFrame is 0, on consequence by making it true;
                if(pass) currentFrame++;
                pass = true;
            }else{
                //If none of above work may leand us on unexpected Error when the loop start over again, probably cuz the json file miss something -me hhhhh
                throw new RandomErrors('حدث خطأ أثناء البحث عن الصفحة التالية 🥲\nيرجى المحاولة لاحقا 😘')
            }
        }
        
    } catch (error) {

        if (error.code === 'InteractionCollectorError' || error.message.includes('time')){
            //Updating the story position, xp and make the buttons disabled if the collector time is over
            try {
                const oldXp = (await Management.selectManager(['xp'], 'players', ['player_id'], [msg.author.id]))[0].xp;
                await Management.updateManager(['story_position', 'xp'], 'players', [position, `${Number(oldXp) + xp}`], ['player_id'], [msg.author.id]);
                buttons.forEach(b => b.setDisabled(true));
                await confirmationMsg.edit({content: `${msg.author}\nلقد إنتهى الوقت المحدد ❌\nلقد تم حفظ تقدمكم بنجاح 😘`});
                return;
            } catch (error) {
                throw error;
            }
        } else {
            throw error;
        }

    }
} 

//Count how many an array items r repeated
function count(arr){
    let final = {};
    for(val of arr){
        final[val] = (final[val] || 0) + 1;
    };
    return final;
}

//Count points from an attaque
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

//Generate a chest based on a type param
function chestGenerator(type = false){
    try {
        let [chest, chances] = [undefined, 0];

        const rand = Math.random() * 60;
        if(type){
            chest = chests.find(obj => obj.type === type);
        }else{
            for(const chestType of chests){
                chances += chestType.rate;
                if(rand < chances){
                    chest = chestType;
                    break;
                }
            }
        }
        if(!chest) throw new RandomErrors('حدث خطأ أثناء توليد الصندوق!! 🥲\nيرجى المحاولة لاحقا 😘');

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

//Calculate the lvl of the users
function getLvl(xp){
    try {
        let theGorge = 100;
        let lvl = 0;
        while(xp > theGorge){
            xp = xp - theGorge;
            lvl++;
            theGorge += 100;
        }
        return {lvl, xp};
    } catch (error) {
        throw error;
    }
}

module.exports = { random, gameHandling, count, pointsCollector, chestGenerator, getLvl };