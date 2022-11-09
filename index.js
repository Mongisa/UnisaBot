const {Collection, GatewayIntentBits, Client} = require('discord.js')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const mongo = require('./mongo')
const fs = require('fs')

require('dotenv').config()

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates] })

client.on('ready', async () => {
    module.exports = client

    await mongo().then(mongoose => {
        try {
            console.log('Connected to mongo! ✅')
        } catch (e) {
            console.log('error')
        }
    })

    await registerCommands()
    await loadEvents()
    await onReadyActions()

    console.log('UnisaBot is online!')
})

client.login(process.env.BOT_TOKEN)

async function registerCommands () {

    const commands = []
    
    client.commands = new Collection()

    const readCommands = (dir = '') => {
    
        const baseFolder = 'commands'
        const result = fs.readdirSync(`./${baseFolder}${dir}`)

        if(!result.length) return
    
        result.forEach((obj) => {

            if(obj.endsWith('.js')) {
            
                const command = require(`./${baseFolder}${dir}/${obj}`)
                commands.push(command.data.toJSON())
                client.commands.set(command.data.name, command)

                console.log(`✅ [ ${obj} ] command loaded `)

            } else {
                readCommands(`/${obj}`)
            }

        })

    }
    await readCommands()


    const rest = new REST({version: '10'}).setToken(process.env.BOT_TOKEN)

    try {
        console.log(`⏳ Started refreshing application (/) commands`)

        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })

        console.log('✅ Successfully reloaded application (/) commands')
    } catch (e) {
        console.error(e)
    }

}

async function loadEvents(dir = '') {
    const baseFolder = 'events'
        const result = fs.readdirSync(`./${baseFolder}${dir}`)

        if(!result.length) return
    
        result.forEach((obj) => {

            if(obj.endsWith('.js')) {
            
                require(`./${baseFolder}${dir}/${obj}`)

                console.log(`✅ [ ${obj} ] event loaded`)

            } else {
                loadEvents(`/${obj}`)
            }

        })
}

async function onReadyActions(dir = '') {
    const baseFolder = 'onReadyActions'
        const result = fs.readdirSync(`./${baseFolder}${dir}`)

        if(!result.length) return
    
        result.forEach((obj) => {

            if(obj.endsWith('.js')) {
            
                require(`./${baseFolder}${dir}/${obj}`)()

                console.log(`⚡ [ ${obj} ] action executed`)

            } else {
                onReadyActions(`/${obj}`)
            }

        })
}