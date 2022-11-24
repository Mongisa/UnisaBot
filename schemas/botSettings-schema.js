const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const unreqString = {
    type: String,
    required: false
}

const unreqNumber = {
    type: Number,
    required: false
}

const botSettingsSchema = mongoose.Schema({
    name: reqString,

    //Spotify
    token: unreqString,
    expires_in: unreqString,
    expires_date: unreqString,

    //Bot Stats
    uptime: unreqNumber
})

module.exports = mongoose.model('botSettings', botSettingsSchema)