//Imposta lo stato del bot (cambia ogni 5 minuti)
const client = require('../index')
const botActivities = require('../botActivities.json')

module.exports = async () => {
    const time = 5 * 60 * 1000
    
    const setActivity = () => {
        
        const index = randomIndex(botActivities)
        const activity = botActivities[index]

        switch(activity.type) {
            case 'PLAYING':
                activity.type = 0
            break
            case 'WATCHING':
                activity.type = 3
            break
            case 'LISTENING':
                activity.type = 2
            break
            case 'STREAMING':
                activity.type = 1
            break
        }

        client.user.setPresence({ activities: [{ name: activity.activity, type: activity.type }] })
    }

    setActivity()

    setInterval(() => {
        setActivity()
    }, time)
}

function randomIndex (botActivities) {
    return Math.floor(Math.random() * (botActivities.length - 1))
}