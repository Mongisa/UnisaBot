//Inizializza statistiche temporali bot
const botSettingsSchema = require('../schemas/botSettings-schema')

module.exports = async () => {
    setInterval(async () => {
        await botSettingsSchema.findOneAndUpdate({
            name: 'bot stats'
        },{
            name: 'bot stats',
            $inc: {
                uptime: 1
            }
        },{
            upsert: true
        })
    }, 1000 * 60) //1 minuto
}