const client = require('../index')
const { Birthday, Timezone } = require('discord-birthday')

module.exports = () => {
    client.birthday = new Birthday(client, {
        timezone: Timezone.EuropeRome,
        hour: 10,
        minute: 55,
        path: './birthday.json'
    })
}