const { SlashCommandBuilder, EmbedBuilder, inlineCode } = require('discord.js')
const ms = require('ms')
const userStats = require('../../schemas/user-schema')
const slapsSchema = require('../../schemas/slaps-schema')
const levelingSystem = require('../../levelingSystem')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mystats')
        .setDescription('📊 Mostra le tue statistiche nel server'),
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
            interaction.reply({ content: inlineCode('⚠️| Ancora non posseggo tue informazioni!'), ephimeral: true })
            return
        }

        const slapsData = await slapsSchema.findOne({
            userId
        })

        const joinedAt = new Date(interaction.member.joinedTimestamp).toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        })

        const createdAt = new Date(interaction.user.createdAt).toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        })

        const userStatsEmbed = new EmbedBuilder()
            .setTitle(`📊 Statistiche ${username} | ${interaction.guild.name} 📊`)
            .setThumbnail(interaction.user.avatarURL())
            .setColor('Gold')

            .setFields(
                { name: '🗓️ Data Creazione Account', value: createdAt },
                { name: '🗓️ Data Unione Server', value: joinedAt },
                { name: '🔢 Messaggi Totali Inviati', value: result.totalMessagesSent?.toString() || '0' },
                { name: `Interazioni con ${interaction.client.user.username}`, value: result.totalInteractions?.toString() || '0' },
            )

            .setTimestamp()
            .setFooter({ text: 'Powered by Discord.js', iconURL: 'https://www.clipartmax.com/png/middle/89-894960_js-discord-bot-logo-node-js-and-react-js.png' })

        if(slapsData.data[guildId]) {
            userStatsEmbed.addFields({ name: '✋ Schiaffi Ricevuti', value: slapsData.data[guildId].toString() })
        }

        const levelingData = await levelingSystem.getUserData(guildId, userId)

        if(levelingData) {
            userStatsEmbed.addFields({ name: '🕒 Tempo in chat vocale', value: ms(levelingData.Time, { long: true }).toString() })

            //Calcolo percentuale tempo rispetto al #1
            const usersArray = await levelingSystem.sortUsers(guildId)
            const topUserTime = usersArray[0].Time
            const perc = Math.round(levelingData.Time / topUserTime * 100)

            userStatsEmbed.addFields({ name: `% tempo rispetto al #1 ${usersArray[0].Username}`, value: `${perc}%` })
        }

        interaction.reply({ embeds: [userStatsEmbed] })
    }
}