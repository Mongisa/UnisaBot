const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const botSettingsSchema = mongoose.Schema({
    name: reqString,
    token: reqString,
    expires_in: reqString,
    expires_date: reqString
})

module.exports = mongoose.model('botSettings', botSettingsSchema)