const { SlashCommandBuilder } = require('discord.js')
const levelingSystem = require('../../levelingSystem')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Mostra la classifica dei punti'),
    /**
     * 
     * @param {import('discord.js').Interaction} interaction 
     */
    async execute(interaction) {
        const userId = interaction.user.id
        const guildId = interaction.guildId

        const leaderboardEmbed = await levelingSystem.generateLeaderboard(guildId, userId)

        leaderboardEmbed
            .setTitle(`📊 Classifica dei punti [${interaction.guild.name}] 📊`)
            .setColor('Random')
            .setThumbnail(interaction.guild.iconURL({ dynamic: false }))
            .setTimestamp()
            .setFooter({ text: 'Powered by Discord.js', iconURL: 'https://www.clipartmax.com/png/middle/89-894960_js-discord-bot-logo-node-js-and-react-js.png' })
    
        interaction.reply({ embeds: [leaderboardEmbed] })
    }
}