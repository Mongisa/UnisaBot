//Aggiorna il numero dei membri del contatore dei membri del server (se presente)
const client = require('../index')
const guildsSettingsSchema = require('../schemas/guildsSettings-schema')

module.exports = async () => {
    const guildsSettings = await guildsSettingsSchema.find()

    guildsSettings.forEach(async guildSettings => {
        
        if(!guildSettings.memberCountChannel.channelId) return

        const channel = client.channels.cache.get(guildSettings.memberCountChannel.channelId)

        //Se il canale non esiste, lo rimuove dal database
        if(!channel) {
            guildSettings.memberCountChannel.channelId = null
            guildSettings.memberCountChannel.name = null
            guildSettings.save()
            return
        }

        //Controlla se il nome del canale è uguale a quello salvato nel database
        if(channel.name === guildSettings.memberCountChannel.name.replace('_num_', channel.guild.memberCount)) return

        //Se il nome del canale è diverso, lo aggiorna
        await channel.setName(guildSettings.memberCountChannel.name.replace('_num_', client.guilds.cache.get(guildSettings.guildId).memberCount))
    })
}