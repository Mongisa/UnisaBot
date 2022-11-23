const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autobus')
        .setDescription('Informazioni sugli autobus universitari')
        .addSubcommand(subcommand =>
            subcommand
                .setName('busitalia')
                .setDescription('Informazioni sugli autobus di Busitalia')
                .addStringOption(option =>
                    option
                        .setName('linea')
                        .setDescription('Linea da cercare')
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        ),
    /**
    * @param {import('discord.js').Interaction} interaction
    */
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand()
        const linea = interaction.options.getString('linea')

        switch(subcommand) {
            case 'busitalia':
                busitalia(interaction)
            break
        }
    },
    /**
    * @param {import('discord.js').Interaction} interaction
    */
    async autocomplete(interaction) {
        const subcommand = interaction.options.getSubcommand()
        const focusedValue = interaction.options.getFocused()

        if(subcommand === 'busitalia') {
            
        }

    }
}

//Funzioni
/**
 * @param {import('discord.js').Interaction} interaction
 */
async function busitalia(interaction) {
    const linea = interaction.options.getString('linea')

    console.log(linea)
}