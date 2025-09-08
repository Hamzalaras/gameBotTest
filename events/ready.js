const { Events } = require('discord.js');
const { ErrorUnit } = require('../centralUnits/errorUnit.js');

module.exports = {
    once: true,
    name: Events.ClientReady,
    async execute(myBot){
        try {
            console.log(`Ready ~~~ !`);
            //TODO: PRINT THIS IN MY DASHBOARD;
        } catch (error) {
            console.error(error);
        }
    }
}