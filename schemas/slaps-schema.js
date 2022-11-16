const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const unreqString = {
    type: String,
    require: false
}

const slapsSchema = mongoose.Schema({
    userId: reqString,
    username: unreqString,
    data: {
        type: Object,
        required: true
    }
})

module.exports = mongoose.model('slaps', slapsSchema)