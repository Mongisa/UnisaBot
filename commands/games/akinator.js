const { SlashCommandBuilder } = require('discord.js')
const akinator = require('discord.js-akinator')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('akinator')
        .setDescription('Gioca ad akinator tramite il bot')
        .setDMPermission(false),
    /**
    * @param {import('discord.js').Interaction} interaction 
    */    
    async execute(interaction) {
        akinator(interaction, {
            language: 'it',
            useButtons: true
        })
    }
}