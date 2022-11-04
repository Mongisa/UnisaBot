const client = require('../index')

client.on('interactionCreate', async (interaction) => {

    if(!interaction.isCommand()) return
    const command = client.commands.get(interaction.commandName)

    if(!command) return

    try {
        await command.execute(interaction)
    } catch(e) {
        console.error(e)

        await interaction.reply({
            content: 'Si è verificato un errore durante l\'esecuzione del comando',
            ephemeral: true
        })
    }
})