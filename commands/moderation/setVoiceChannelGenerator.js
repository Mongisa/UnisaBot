const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const guildSettingsSchema = require('../../schemas/guildsSettings-schema')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('impostacanaleprivato')
        .setDescription('Permette di impostare un generatore di chat vocali private')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName('voicechannelid')
                .setDescription(`L'id del canale vocale generatore`)
                .setRequired(true)
                .setMinLength(19)
                .setMaxLength(19)   
        )
        .addStringOption(option =>
            option
                .setName('textchannelid')
                .setDescription(`L'id del canale testuale dove ricevere notifiche`)
                .setMinLength(19)
                .setMaxLength(19)    
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
        
        const voicechannelId = data.filter(e => {
            return e.name == 'voicechannelid'
        })[0].value

        var textchannelId = data.filter(e => {
            return e.name == 'textchannelid'
        })

        if(textchannelId.length) {
            textchannelId = textchannelId[0].value
        } else {
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

        interaction.reply('Factos')
    }
}