const mongoose = require('mongoose')

module.exports = async () => {

    await mongoose.connect(process.env.MONGO_PATH, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        keepAlive: true,
        maxPoolSize: 10
    })
    return mongoose

}