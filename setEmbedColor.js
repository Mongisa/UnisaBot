//Comando non ancora implementato
const { SlashCommandBuilder, Colors } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setembedcolor')
        .setDescription('🎨 Imposta il colore dell\'embed')
        .addStringOption(option =>
            option
                .setName('embedid')
                .setDescription('ID dell\'embed')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('color')
                .setDescription('Colore dell\'embed')
                .setRequired(true)
                .setAutocomplete(true)
                ),
    /**
     * @param {import('discord.js').Interaction} interaction
     * */
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true)

        if(focusedOption.name === 'color') {
            const colors = Object.keys(Colors)
            const color = focusedOption.value.toLowerCase()

            const filtered = colors.filter(c => c.toLowerCase().startsWith(color))

            if(filtered.length === 0) return

            if(filtered.length >= 25) {
                filtered.length = 25
            }

            const mapped = filtered.map(c => ({name: c, value: c.toLowerCase()}))

            await interaction.respond(mapped)
        }
    },
    /**
     * @param {import('discord.js').Interaction} interaction
     * */
    async execute(interaction) {
        
    }
}