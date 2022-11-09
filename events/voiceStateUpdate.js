const client = require('../index')
const { ChannelType, EmbedBuilder } = require('discord.js')
const guildsSettingsSchema = require('../schemas/guildsSettings-schema')

client.on('voiceStateUpdate', async (oldState, newState) => {
    if(newState.member.user.bot) return

    const guildId = newState.guild.id
    const userId = newState.member.user.id
    
    const result = await guildsSettingsSchema.findOne({
        guildId
    })
    
    if(!result) return

    var channelsArray = result.privateVoiceChannels.privateChannels

    const channelObj = channelsArray.filter(e => { return e.id == oldState.channelId })

    if(newState.channelId == null && channelObj.length && channelObj[0].owner == userId) {
        newState.guild.channels.cache.get(channelObj[0].id).delete()

        channelsArray = channelsArray.filter(e => {
            return e != channelObj[0]
        })

        await updateDatabase(guildId, result, channelsArray)

        return
    }

    if(newState.channelId != result.privateVoiceChannels.privateChannelsGeneratorId) return

    const parentId = newState.channel.parentId

    const channel = await newState.guild.channels.create({ name: `🔓 ${newState.member.nickname|| newState.member.user.username}'s Private Room`, type: ChannelType.GuildVoice })
    
    await channel.setParent(parentId)
    await channel.setPosition(0)
    
    //Sposta l'utente nella nuova chat creata
    await newState.setChannel(channel.id)

    const privateChannels = result.privateVoiceChannels.privateChannels

    privateChannels.push({ 'id': channel.id, 'owner': userId })

    await updateDatabase(guildId, result, channelsArray)

    //Gestione Messaggio Dashboard Private Channel

    const textAlertsChatId = result.privateVoiceChannels.textAlertsChatId

    const textChannel = client.guilds.cache.get(guildId).channels.cache.get(textAlertsChatId)

    if(!textChannel) return

    const dashboardEmbed = new EmbedBuilder()
        .setTitle(`${newState.member.nickname|| newState.member.user.username}'s Private Room`)
        .addFields(
            { name: 'Stato', value: '🔓 Aperta' },
            { name: 'Proprietario', value: `<@${newState.member.id}>` }
        )
        .setThumbnail(newState.member.user.avatarURL())
        .setTimestamp()

    await textChannel.send({ embeds: [dashboardEmbed] })
})

//Funzioni

async function updateDatabase(guildId, result, channelsArray) {
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
        new: true,
        upsert: true
    })
}