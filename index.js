const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const myBot = new Client({
    intents: [
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

myBot.commands = new Collection();

const commandsFolderPath = path.join(__dirname, 'commands');
const commandsFolderFolders = fs.readdirSync(commandsFolderPath);
for(const folder of commandsFolderFolders){
    const folderPath = path.join(commandsFolderPath, folder);
    const folderFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    for(const file of folderFiles){
        const filePath = path.join(folderPath, file);
        const command = require(filePath);
        // CHEKING IF THE COMMAND IS SLASH OR MSG_CREATE
        if('name' in command && 'execute' in command){
            myBot.commands.set(command.name[0], command);
        }else if('data' in command && 'execute' in command){
            myBot.commands.set(command.data.name, command);
        };
    };
};

const eventFolderPath = path.join(__dirname, 'events');
const eventFolderFiles = fs.readdirSync(eventFolderPath).filter(file => file.endsWith('.js'));
for(const file of eventFolderFiles){
    const filePath = path.join(eventFolderPath, file);
    const event = require(filePath);
    if(event.on){
        myBot.on(event.name, (...args) => event.execute(...args));
    }else if(event.once){
        myBot.once(event.name, (...args) => event.execute(...args));
    };
};





myBot.login(process.env.TOKEN);