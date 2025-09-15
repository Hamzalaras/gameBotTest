const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const { ErrorUnit } = require('./errorUnit.js');
const path = require('path');
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
    let position = (await Management.selectManager(['story_position'], 'players', 'player_id', msg.author.id))[0].story_position;

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
                            
            const buttons = data.subHistory.map(obj => {
                return  new ButtonBuilder()
                        .setCustomId(`${obj.button}`)
                        .setLabel(`${obj.button}`)
                        .setStyle(obj.buttonStyle)
            }).concat(quiteBTN);
            const row = new ActionRowBuilder().addComponents(buttons);

            await confirmationMsg.edit({embeds: []});
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


module.exports = { random, gameHandling };