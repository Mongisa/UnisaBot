const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const userStats = require('../../schemas/user-schema')
const slapsSchema = require('../../schemas/slaps-schema')

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

        const slapsData = await slapsSchema.findOne({
            userId
        })

        const userStatsEmbed = new EmbedBuilder()
            .setTitle(`📊 Statistiche ${username} | ${interaction.guild.name} 📊`)
            .setThumbnail(interaction.user.avatarURL())
            .setColor('Gold')

            .setFields(
                { name: 'Data Creazione Account', value: interaction.user.createdAt.toDateString() },
                { name: 'Data Unione Server', value: interaction.member.joinedAt.toString() },
                { name: 'Messaggi Totali Inviati', value: result.totalMessagesSent.toString() }
            )

            .setTimestamp()

        if(slapsData.data[guildId]) {
            userStatsEmbed.addFields({ name: 'Schiaffi Ricevuti', value: slapsData.data[guildId].toString() })
        }

        interaction.reply({ embeds: [userStatsEmbed] })
    }
}