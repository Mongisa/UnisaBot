const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js')
const guildsSettingsSchema = require('../../schemas/guildsSettings-schema')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('welcomechannel')
        .setDescription('Imposta il canale dove ricevere le notifiche di benvenuto.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addChannelOption(option =>
            option
            .setName('textchannelid')
            .setDescription(`L'id della chat testuale. Non inviare nulla per disattivare la funzione`)
            .addChannelTypes(ChannelType.GuildText)
        ),
    /**
    * @param {import('discord.js').Interaction} interaction 
    */
    async execute(interaction) {
        const guildId = interaction.guildId
        const guildName = interaction.guild.name

        const data = interaction.options.data.filter(e => {
            return e.name == 'textchannelid'
        })

        var welcomeChannelId = null

        if(data.length) {
            welcomeChannelId = data[0].value
        }

        await guildsSettingsSchema.findOneAndUpdate({
            guildId
        },{
            guildId,
            guildName,
            welcomeChannelId
        },{
            upsert: true,
            new: true
        })

        if(welcomeChannelId) {
            interaction.reply({ content: `<#${interaction.guild.channels.cache.get(welcomeChannelId).id}> è stato impostato per i messaggi di benvenuto`, ephemeral: true })
        } else {
            interaction.reply({ content: `\`\`La funzione di messaggi di benvenuto è stata disabilitata\`\``, ephemeral: true })
        }
        
    }
}