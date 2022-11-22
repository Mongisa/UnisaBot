const mongoose = require('mongoose')

const reqString = {
    type: String,
    required: true
}

const cacheSchema = mongoose.Schema({
    cacheId: reqString,
    pod: Object
})

module.exports = mongoose.model('cacheSchema', cacheSchema)