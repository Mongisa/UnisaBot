const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js')
const guildSettingsSchema = require('../../schemas/guildsSettings-schema')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('impostacanaleprivato')
        .setDescription('Permette di impostare un generatore di chat vocali private')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addChannelOption(option =>
            option
                .setName('voicechannelid')
                .setDescription(`L'id del canale vocale generatore`)
                .addChannelTypes(ChannelType.GuildVoice) 
        )
        .addChannelOption(option =>
            option
                .setName('textchannelid')
                .setDescription(`L'id del canale testuale dove ricevere notifiche`)
                .addChannelTypes(ChannelType.GuildText)   
        )
        /*.addNumberOption(option =>
            option
                .setName('numeromax')
                .setDescription('Il numero massimo di chat vocali contemporaneamente')
                .setMinValue(1)
        )*/,
    /**
    * @param {import('discord.js').Interaction} interaction 
    */
    async execute(interaction) {
        const data = interaction.options.data
        const guildId = interaction.guildId
        const guildName = interaction.guild.name
        
        var voicechannelId = data.filter(e => {
            return e.name == 'voicechannelid'
        })

        var textchannelId = data.filter(e => {
            return e.name == 'textchannelid'
        })

        if(textchannelId.length) {
            textchannelId = textchannelId[0].value
        } else {
            textchannelId = null
        }

        if(voicechannelId.length) {
            var voicechannelId = voicechannelId[0].value
        } else {
            voicechannelId = null
            textchannelId = null
        }

        await guildSettingsSchema.findOneAndUpdate({
            guildId
        },{
            guildId,
            guildName,
            privateVoiceChannels: {
                privateChannelsGeneratorId: voicechannelId,
                textAlertsChatId: textchannelId,
                privateChannels: []
            }
        },{
            new: true,
            upsert: true
        })

        if(voicechannelId != null && textchannelId != null) {
            interaction.reply({ content:`<#${voicechannelId}> è stato impostato come generatore di chat vocali private \n<#${textchannelId}> è stata impostata per l'invio della dashboard`, ephemeral: true })
        } else if(voicechannelId != null && textchannelId == null) {
            interaction.reply({ content:`<#${voicechannelId}> è stato impostato come generatore di chat vocali private`, ephemeral: true})
        } else if(voicechannelId == null &&  textchannelId == null) {
            interaction.reply({ content:`\`\`La funzione di generatore di chat private è stata disabilitata\`\``, ephemeral: true })
        }
    }
}