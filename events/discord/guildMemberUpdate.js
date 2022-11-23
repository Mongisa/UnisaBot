const client = require('../../index')
const guildsSettingsSchema = require('../../schemas/guildsSettings-schema')

client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const guildId = newMember.guild.id

    const result = await guildsSettingsSchema.findOne({
        guildId
    })

    if(!result) return

    //Aggiorna il numero dei membri del contatore dei membri del server (se presente)
    if(result.memberCountChannel.channelId) {
        const channel = client.channels.cache.get(result.memberCountChannel.channelId)

        if(!channel) {
            result.memberCountChannel.channelId = null
            result.memberCountChannel.name = null
            result.save()
            return
        }

        channel.setName(result.memberCountChannel.name.replace('_num_', newMember.guild.memberCount))
    }
})