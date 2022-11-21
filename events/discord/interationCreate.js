const client = require('../../index')

client.on('interactionCreate', async (interaction) => {

    if(interaction.isCommand()) {
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
        return
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