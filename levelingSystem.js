const LevelingClient = require('./modules/userLevelingSystem')
const client = require('./index')

const levelingSystem = new LevelingClient(client, process.env.MONGO_PATH, true)

module.exports = levelingSystem