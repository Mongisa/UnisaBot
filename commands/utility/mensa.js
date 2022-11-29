const { SlashCommandBuilder, inlineCode, EmbedBuilder, cleanContent } = require('discord.js');
const mensaAPI = require('../../APIs/mensaUnisaAPI')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mensa')
        .setDescription('Mostra il menù della mensa universitaria di Salerno')
        .addStringOption(option =>
            option.setName('pasto')
            .setDescription('Pasto da visualizzare')
            .setRequired(true)
            .addChoices(
                { name: 'Pranzo', value: 'pranzo' },
                { name: 'Cena', value: 'cena' },
            )
        ),
    /**
     * 
     * @param {import('discord.js').Interaction} interaction 
     */
    async execute(interaction) {
        const meal = interaction.options.getString('pasto');
        
        try {
            if(meal === 'pranzo') {
                const lunch = await mensaAPI.getLunch()
                pranzo(interaction, lunch.link)
            } else if(meal === 'cena') {
                const dinner = await mensaAPI.getDinner()
                cena(interaction, dinner.link)
            }
        } catch (error) {
            console.log(error)
            interaction.reply({ content: `Si è verificato un errore: ${inlineCode(error)}`, ephemeral: true })
        }
    }
}

//Funzioni

/**
 * @param {import('discord.js').Interaction} interaction
 * @param {String} link
 */
async function pranzo(interaction, link) {
    const embed = new EmbedBuilder()
        .setTitle('Menù del pranzo')
        .setDescription(`[Clicca qui](${link}) per visualizzare il menù`)
        .setColor('#FFA500')
        .setTimestamp()

    await interaction.reply({ embeds: [embed] })
}

/**
 * @param {import('discord.js').Interaction} interaction
 * @param {String} link
 */
async function cena(interaction, link) {
    const embed = new EmbedBuilder()
        .setTitle('Menù della cena')
        .setDescription(`[Clicca qui](${link}) per visualizzare il menù`)
        .setColor('#FFA500')
        .setTimestamp()

    await interaction.reply({ embeds: [embed] })
}