const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const userStats = require('../../schemas/user-schema')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mystats')
        .setDescription('Mostra le tue statistiche nel server'),
    /**
    * @param {import('discord.js').Interaction} interaction 
    */
    async execute(interaction) {
        const userId = interaction.user.id
        const guildId = interaction.guildId
        const username = interaction.user.username
        
        const result = await userStats.findOne({
            guildId,
            userId
        })

        if(!result) {
            interaction.reply({ content: 'Ancora non posseggo tue informazioni!', ephimeral: true })
            return
        }

        const userStatsEmbed = new EmbedBuilder()
            .setTitle(`📊 Statistiche ${username} | ${interaction.guild.name} 📊`)
            .setThumbnail(interaction.user.avatarURL())

            .setFields(
                { name: 'Messaggi Totali Inviati', value: result.totalMessagesSent.toString() },
                { name: 'Data Creazione Account', value: interaction.user.createdAt.toDateString() },
                { name: 'Data Unione Server', value: interaction.member.joinedAt.toString() },
            )

            .setTimestamp()

        interaction.reply({ embeds: [userStatsEmbed] })
    }
}