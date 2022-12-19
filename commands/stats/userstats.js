const { SlashCommandBuilder, inlineCode, EmbedBuilder } = require('discord.js')
const ms = require('ms')
const userStats = require('../../schemas/user-schema')
const slapsSchema = require('../../schemas/slaps-schema')
const levelingSystem = require('../../levelingSystem')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userstats')
        .setDescription('📊 Mostra le statistiche di un utente nel server')
        .addUserOption(option => 
            option
                .setName('user')
                .setDescription('Utente di cui mostrare le statistiche')
                .setRequired(true)
        ),

    /**
     * @param {import('discord.js').Interaction} interaction
     */
    async execute(interaction) {
        const targetUser = interaction.guild.members.cache.get(interaction.options.getUser('user').id)
        const guildId = interaction.guildId

        const targetUserId = targetUser.user.id
        const targetUserUsername = targetUser.user.username

        if(targetUser.bot) {
            await interaction.reply({ content: inlineCode('⚠️| Non posso mostrare le statistiche di un bot!'), ephimeral: true })
            return
        }

        const result = await userStats.findOne({
            guildId,
            userId: targetUserId
        })

        if(!result) {
            interaction.reply({ content: inlineCode('⚠️| Ancora non posseggo informazioni su questo utente!'), ephimeral: true })
            return
        }

        const slapsData = await slapsSchema.findOne({
            userId: targetUserId
        })

        const joinedAt = new Date(targetUser.joinedTimestamp).toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        })

        const createdAt = new Date(targetUser.user.createdAt).toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        })

        const userStatsEmbed = new EmbedBuilder()
            .setTitle(`📊 Statistiche ${targetUserUsername} | ${interaction.guild.name} 📊`)
            .setThumbnail(targetUser.user.avatarURL())
            .setColor('Gold')

            .setFields(
                { name: '🗓️ Data Creazione Account', value: createdAt },
                { name: '🗓️ Data Unione Server', value: joinedAt },
                { name: '🔢 Messaggi Totali Inviati', value: result.totalMessagesSent?.toString() || '0' },
                { name: `Interazioni con ${interaction.client.user.username}`, value: result.totalInteractions?.toString() || '0' },
            )

            .setTimestamp()
            .setFooter({ text: 'Powered by Discord.js', iconURL: 'https://www.clipartmax.com/png/middle/89-894960_js-discord-bot-logo-node-js-and-react-js.png' })

        if(slapsData && slapsData.data[guildId]) {
            userStatsEmbed.addFields({ name: '✋ Schiaffi Ricevuti', value: slapsData.data[guildId].toString() })
        }

        const levelingData = await levelingSystem.getUserData(guildId, targetUserId)

        if(levelingData) {
            userStatsEmbed.addFields({ name: '🕒 Tempo in chat vocale', value: ms(levelingData.Time, { long: true }).toString() })
        }

        interaction.reply({ embeds: [userStatsEmbed] })
    }
}