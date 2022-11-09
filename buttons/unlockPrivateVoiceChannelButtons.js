const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const guildsSettingsSchema = require('../schemas/guildsSettings-schema')

module.exports = {
    data: {
        name: 'unlock_channel'
    },
    /**
    * @param {import('discord.js').Interaction} interaction 
    */
    async execute(interaction) {
        if(interaction.member.voice.channelId == null) return

        const guildId = interaction.guildId
        const voiceChannelId = interaction.member.voice.channelId
        const userId = interaction.user.id

        const result = await guildsSettingsSchema.findOne({
            guildId
        })

        if(!result || !result.privateVoiceChannels.privateChannels.length) return

        const channelData = result.privateVoiceChannels.privateChannels.filter(e => { return e.id == voiceChannelId })

        if(!channelData.length || channelData[0].owner != userId || channelData[0].locked == false) return

        const channelObj = interaction.guild.channels.cache.get(channelData[0].id)

        if(!channelObj) return

        const everyoneId = interaction.guild.roles.everyone.id

        channelObj.permissionOverwrites
            .edit(everyoneId, { Connect: true })

        channelObj.setName(`🔓 ${interaction.user.username|| interaction.member.user.username}'s Private Room`)
        
        const dashboardEmbed = await dashboardBuilder(interaction)
        const buttons = await buildButtons()

        await interaction.message.edit({ embeds: [dashboardEmbed], components: [new ActionRowBuilder().setComponents(buttons.buttonLock, buttons.buttonUnlock)] })

        //Update database

        const index = result.privateVoiceChannels.privateChannels.findIndex(e => { return e.id == channelData[0].id })

        const channelsArray = result.privateVoiceChannels.privateChannels

        channelsArray[index].locked = false

        await guildsSettingsSchema.findOneAndUpdate({
            guildId
        },{
            guildId,
            privateVoiceChannels: {
                privateChannelsGeneratorId: result.privateVoiceChannels.privateChannelsGeneratorId,
                textAlertsChatId: result.privateVoiceChannels.textAlertsChatId,
                privateChannels: channelsArray
            }
        },{
            upsert: true,
            new: true
        })
        
        interaction.reply({ content: 'La chat è ora sbloccata', ephemeral: true })
    }
}

//Functions

/**
* @param {import('discord.js').Interaction} interaction 
*/
async function dashboardBuilder(interaction) {
    return new EmbedBuilder()
        .setTitle(`${interaction.user.username|| interaction.member.user.username}'s Private Room`)
        .addFields(
        { name: 'Stato', value: '🔓 Aperta' },
        { name: 'Proprietario', value: `<@${interaction.member.id}>` }
    )
    .setThumbnail(interaction.member.user.avatarURL())
    .setTimestamp()
}

async function buildButtons() {
    const buttonLock = new ButtonBuilder()
        .setCustomId('lock_channel')
        .setEmoji('🔒')
        .setStyle(ButtonStyle.Primary)

    const buttonUnlock = new ButtonBuilder()
        .setCustomId('unlock_channel')
        .setEmoji('🔓')
        .setDisabled()
        .setStyle(ButtonStyle.Primary)
    
    const buttons = {
        buttonLock, buttonUnlock
    }

    return buttons
}