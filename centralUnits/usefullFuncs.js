const { Message, BaseInteraction } = require('discord.js');

function random(array){
    return array[Math.floor(Math.random() * array.length)];
}

async function interOrMsg(msg, response){
    let responseObj = null;
    if(msg instanceof Message){
        responseObj =  await msg.reply(`${msg.author}\n${response} 🥲`);
    }else if(msg instanceof BaseInteraction){
        responseObj = await msg.editReply(`${msg.user}\n${response} 🥲`);
    }
    return responseObj;
}

function dataHandler(){

}

module.exports = { random, interOrMsg };