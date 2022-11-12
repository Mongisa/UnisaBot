const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const reqObject = {
    type: Object,
    required: true
}

const birthdaysSchema = mongoose.Schema({
    botId: reqString,
    guilds: reqObject,
    birthdays: reqObject
})

module.exports = mongoose.model('birthdays', birthdaysSchema)