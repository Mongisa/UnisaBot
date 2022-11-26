const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, inlineCode } = require('discord.js')
const autobusAPI = require('../../APIs/autobusAPI')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autobus')
        .setDescription('🚌 Informazioni sugli autobus universitari')
        .addSubcommand(subcommand =>
            subcommand
                .setName('busitalia')
                .setDescription('🚌 Informazioni sugli autobus di Busitalia')
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
            const lines = await autobusAPI.busitalia.getLines()

            const filtered = lines.filter(line => line.name.toLowerCase().includes(focusedValue.toLowerCase()))

            await interaction.respond(filtered.map(choice => ({name: `${choice.name} - ${choice.from}`, value: choice.name.toLowerCase() })))
        }

    }
}

//Funzioni
/**
 * @param {import('discord.js').Interaction} interaction
 */
async function busitalia(interaction) {
    const selectedLineString = interaction.options.getString('linea')

    const lines = await autobusAPI.busitalia.getLines()

    const selectedLine = lines.find(line => line.name.toLowerCase() == selectedLineString)

    if(!selectedLine) return interaction.reply({content: inlineCode('⚠️| Linea non trovata'), ephemeral: true})

    const lineEmbed = new EmbedBuilder()
        .setTitle(selectedLine.name)
        .setDescription(`Partenza da ${selectedLine.from}`)
        .setFields(
            {name: 'Tipo', value: selectedLine.type}
        )
        .setColor('#50C878')
        .setFooter({text: 'Powered by Busitalia', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Busitalia_logo.svg/512px-Busitalia_logo.svg.png'})

    const linkButton = new ButtonBuilder()
        .setLabel(`🔗 ${selectedLine.name}`)
        .setStyle('Link') 
        .setURL(selectedLine.link)

    await interaction.reply({embeds: [lineEmbed], components: [new ActionRowBuilder().addComponents(linkButton)]})
}