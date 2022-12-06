const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const unreqNumber = {
    type: Number,
    required: false
}

const unreqArray = {
    type: Array,
    required: false
}

const userSchema = mongoose.Schema({
    guildId: reqString,
    guildName: reqString,
    userId: reqString,
    username: reqString,
    totalMessagesSent: unreqNumber,
    totalInteractions: unreqNumber,
    spidCredentialsCookies: unreqArray,
})

module.exports = mongoose.model('users', userSchema)