const {  } = require('discord.js');
const { ErrorUnit, FalseInput } = require('../../centralUnits/errorUnit.js');

module.exports = {
    name: ['تشكيلة', 'مجموعة'],
    path: { 'playCommands': [1, 4]},
    need: true,
    async execute(msg, args){
        try {
            if(!args[1]){
                throw new FalseInput('تشكيلة');
            }
            
        } catch (error) {
            
        }
    }
}