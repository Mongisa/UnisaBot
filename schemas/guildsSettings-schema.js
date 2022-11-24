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

const unreqNumber = {
    type: Number,
    required: false
}

const guildsSettingsSchema = mongoose.Schema({
    guildId: reqString,
    guildName: unreqString,
    //Canale dove vengono inviati i messaggi di benvenuto
    welcomeChannelId: unreqString,
    //Ruolo che viene dato quando un utente entra nel server
    defaultRoleId: unreqString,
    //Generatore di chat privata
    privateVoiceChannels: {
        //Id canale vocale generatore
        privateChannelsGeneratorId: unreqString,
        //Id canale testuale per le allerte
        textAlertsChatId: unreqString,
        //Array delle attuali chat vocali generate nel server
        privateChannels: unreqArray
    },
    //Canale vocale con contatore dei membri del server
    memberCountChannel: {
        channelId: unreqString,
        name: unreqString
    },
    totalInteractions: unreqNumber
})

module.exports = mongoose.model('guildsSettings', guildsSettingsSchema)