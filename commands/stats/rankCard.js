const { SlashCommandBuilder } = require('discord.js')
const levelingSystem = require('../../levelingSystem')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rankcard')
        .setDescription('📊 Mostra la tua rankcard nel server')
        .addUserOption(option => option.setName('user').setDescription('Utente da mostrare')),
    /**
     * @param {import('discord.js').Interaction} interaction
     */
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user
        const userId = user.id
        const guildId = interaction.guildId
        const username = user.username

        const userData = await levelingSystem.getUserData(guildId, userId)

        console.log(userData)
    }
}