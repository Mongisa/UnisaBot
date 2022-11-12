const client = require('../../index')
const userSchema = require('../../schemas/user-schema')

client.on('interactionCreate', async (interaction) => {

    if(interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName)

        if(!command) return

        await updateDatabase(interaction)        

        try {
            await command.execute(interaction)
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
    } else if(interaction.isAutocomplete()) {
        try {
            await command.autocomplete(interaction)
        } catch(e) {
            console.error(e)
        }
    }
})

//Functions

async function updateDatabase(interaction) {
    await userSchema.findOneAndUpdate({
        guildId: interaction.guild.id,
        userId: interaction.user.id
    },{
        guildId: interaction.guild.id,
        userId: interaction.user.id,
        username: interaction.user.username,
        guilName: interaction.guild.name,
        $inc: {
            totalInteractions: 1
        }
    },{
        upsert: true,
        new: true
    })
}