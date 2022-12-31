const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const botSettingsSchema = require('../../schemas/botSettings-schema')
const guildsSettingsSchema = require('../../schemas/guildsSettings-schema')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('botstats')
        .setDescription('📊 Mostra le statistiche del bot'),
    /**
     *  @param {import('discord.js').Interaction} interaction 
     */
    async execute(interaction) {
        const botSettings = await botSettingsSchema.findOne({
            name: 'bot stats'
        })

        const guildsSettings = await guildsSettingsSchema.find()

        var totalInteractions = 0

        guildsSettings.forEach(guild => {
            if(guild.totalInteractions) totalInteractions += guild.totalInteractions
        })

        const { uptime } = botSettings

        const botStatsEmbed = new EmbedBuilder()
            .setTitle('📊 Statistiche del Bot 📊')
            .setColor('DarkPurple')
            .setThumbnail(interaction.client.user.avatarURL())
            .setTimestamp()
            .setFooter({ text: 'Powered by Discord.js', iconURL: 'https://www.clipartmax.com/png/middle/89-894960_js-discord-bot-logo-node-js-and-react-js.png' })

            .setFields(
                { name: '⏱️ Tempo Totale Online', value: `${Math.round(uptime/(60*24))}g${Math.round(uptime%1440/60)}h${Math.round(uptime % 1440 %60)}m` },
                { name: '🔗 Interazioni Totali', value: totalInteractions.toString() },
                { name: '🖧 Server', value: interaction.client.guilds.cache.size.toString() },
                { name: '👤 Utenti', value: interaction.client.users.cache.size.toString() },
                { name: '📟 Versione', value: '1.0.0' },
                { name: '💻 Sviluppatore del Bot', value: 'Mongisa#0590' },
            )

        await interaction.reply({ embeds: [botStatsEmbed] })
    }
}