const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js')
const guildsSettingsSchema = require('../../schemas/guildsSettings-schema')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverstats')
        .setDescription('📊 Mostra le statistiche del server'),
    /**
     * @param {import('discord.js').CommandInteraction} interaction
     */
    async execute(interaction) {
        const guildId = interaction.guildId
        
        const guildSettings = await guildsSettingsSchema.findOne({
            guildId
        })

        const guilsStatsEmbed = new EmbedBuilder()
            .setTitle(`📊 Informazioni Server 📊`)
            .setColor('#C539B4')
            .setFields(
                { name: 'Nome del server', value: interaction.guild.name, inline: true },
                { name: '👥 Membri totali', value: interaction.guild.memberCount.toString(), inline: true },
                { name: '🤖 Bot totali', value: interaction.guild.members.cache.filter(member => member.user.bot).size.toString(), inline: true },
                { name: '🟢 Membri online', value: interaction.guild.members.cache.filter(member => member.presence?.status === 'online' && !member.user.bot).size.toString(), inline: true },
                { name: 'Canali Totali', value: interaction.guild.channels.cache.size.toString(), inline: true },
                { name: 'Canali di Testo', value: interaction.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).size.toString(), inline: true },
                { name: 'Canali Vocali', value: interaction.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildVoice).size.toString(), inline: true },
                { name: 'Ruoli Totali', value: interaction.guild.roles.cache.size.toString(), inline: true },
                { name: 'Ruoli con Permessi di Amministrazione', value: interaction.guild.roles.cache.filter(role => role.permissions.has(PermissionFlagsBits.Administrator)).size.toString(), inline: true },
                { name: `Interazioni con ${interaction.client.user.username}`, value: guildSettings.totalInteractions.toString(), inline: true },
                { name: 'Canale Contatore Membri', value: guildSettings.memberCountChannel.channelId ? `<#${guildSettings.memberCountChannel.channelId}>` : 'Non impostato', inline: true },
                { name: 'Chat Messaggi di Benvenuto', value: guildSettings.welcomeChannelId ? `<#${guildSettings.welcomeChannelId}>` : 'Non impostato', inline: true },
                { name: '👤 Ruolo Assegnato di Default', value: guildSettings.defaultRoleId ? `<@&${guildSettings.defaultRoleId}>` : 'Non impostato', inline: true },
            )
            .setTimestamp()
            .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
            .setFooter({ text: 'Powered by Discord.js', iconURL: 'https://www.clipartmax.com/png/middle/89-894960_js-discord-bot-logo-node-js-and-react-js.png' })
                
        await interaction.reply({ embeds: [guilsStatsEmbed] })
        }
}
