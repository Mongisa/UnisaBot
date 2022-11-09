//Questo script pulisce i canali vocali privati vuoti sincronizzando il database
const client = require('../index')
const guildsSettingsSchema = require('../schemas/guildsSettings-schema')

module.exports = async () => {
    var result = await guildsSettingsSchema.find()

    const guildsArray = result.filter(e => {
        return e.privateVoiceChannels.privateChannels.length != 0
    })

    if(!guildsArray.length) return

    guildsArray.forEach(async guild => {

        const index = result.indexOf(guild)
        const guildObj = client.guilds.cache.get(guild.guildId)
        const voiceStates = guildObj.voiceStates.cache

        const voiceStatesArray = []

        voiceStates.forEach(e => {
            voiceStatesArray.push(e.channelId)
        })

        guild.privateVoiceChannels.privateChannels.forEach(async channel => {

            const channelObj = guildObj.channels.cache.get(channel.id)

            if(!channelObj) {

                //Elimina il canale dal database
                
                const newArray = result[index].privateVoiceChannels.privateChannels.filter(e => {
                    return e.id != channel.id
                })

                await guildsSettingsSchema.findOneAndUpdate({
                    guildId: guild.guildId
                },{
                    guildId: guild.guildId,
                    privateVoiceChannels: {
                        privateChannelsGeneratorId: result[index].privateVoiceChannels.privateChannelsGeneratorId,
                        textAlertsChatId: result[index].privateVoiceChannels.textAlertsChatId,
                        privateChannels: newArray
                    }
                },{
                    new: true,
                    upsert: true
                })

            } else if (!voiceStatesArray.filter(e => { return e == channel.id }).length) {
                
                //Se il canale vocale temporaneo è vuoto lo cancella sia da discord che dal database

                await channelObj.delete()

                const newArray = result[index].privateVoiceChannels.privateChannels.filter(e => {
                    return e.id != channelObj.id
                })

                await guildsSettingsSchema.findOneAndUpdate({
                    guildId: guild.guildId
                },{
                    guildId: guild.guildId,
                    privateVoiceChannels: {
                        privateChannelsGeneratorId: result[index].privateVoiceChannels.privateChannelsGeneratorId,
                        textAlertsChatId: result[index].privateVoiceChannels.textAlertsChatId,
                        privateChannels: newArray
                    }
                },{
                    new: true,
                    upsert: true
                })
            }
        })

    })
}