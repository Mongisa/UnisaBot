const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const unreqString = {
    type: String,
    required: false
}

const unreqArray = {
    type: Array,
    required: false
}

const guildsSettingsSchema = mongoose.Schema({
    guildId: reqString,
    guildName: unreqString,
    privateVoiceChannels: {
        //Id canale vocale generatore
        privateChannelsGeneratorId: unreqString,
        //Id canale testuale per le allerte
        textAlertsChatId: unreqString,
        //Array delle attuali chat vocali generate nel server
        privateChannels: unreqArray
    }
})

module.exports = mongoose.model('guildsSettings', guildsSettingsSchema)