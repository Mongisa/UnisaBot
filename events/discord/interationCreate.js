const client = require('../../index')
const guildsSettingsSchema = require('../../schemas/guildsSettings-schema')
const userSchema = require('../../schemas/user-schema')

client.on('interactionCreate', async (interaction) => {

    if(interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName)

        if(!command) return

        try {
            await command.execute(interaction)

            await refreshDatabaseStats(interaction.guildId, interaction.user.id)

        } catch(e) {
            console.error(e)

            await interaction.reply({
                content: 'Si è verificato un errore durante l\'esecuzione del comando',
                ephemeral: true
            })
        }
        
    } else if(interaction.isButton()) {
        const { buttons } = client
        const { customId } = interaction
        const button = buttons.get(customId)

        if(!button) return new Error('There is no code for this button!')

        try {
            await button.execute(interaction)
        } catch(e) {
            await interaction.reply({ content: `C'è stato un problema durante l'esecuzione del bottone`, ephemeral: true })

            console.log(e)
        }
    }else if(interaction.isAutocomplete()) {
        const command = client.commands.get(interaction.commandName)

        if(command.autocomplete) {
            command.autocomplete(interaction)
        }
    }
})

//Funzioni
/**
 * @param {String} guildId Id del server
 * @param {String} userId Id dell'utente
 */
async function refreshDatabaseStats(guildId, userId) {
    return new Promise(async (resolve, reject) => {
        try {
            await guildsSettingsSchema.findOneAndUpdate({
                guildId
            }, {
                guildId,
                $inc: {
                    totalInteractions: 1
                },
            }, {
                upsert: true
            })

            const data = await userSchema.findOneAndUpdate({
                userId,
                guildId
            }, {
                userId,
                guildId,
                $inc: {
                    totalInteractions: 1
                },
            }, {
                upsert: true
            })

            resolve()
        } catch(e) {
            reject('Error while updating database stats')
        }
    })
}