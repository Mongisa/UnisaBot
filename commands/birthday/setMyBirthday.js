const { SlashCommandBuilder } = require('discord.js')
const client = require('../../index')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setmybirthday')
        .setDescription('Imposta il tuo compleanno. Riceverai gli auguri dal bot')
        .setDMPermission(false)
        .addStringOption(option => 
            option
                .setName('birthdate')
                .setDescription('La data del suo compleanno in formato gg-mm-aaaa')
                .setRequired(true) 
                .setMinLength(8)
                .setMaxLength(10)   
        ),
    /**
     * @param {import('discord.js').Interaction} interaction
     * @param {import('discord-birthday').Client} client
     */
    async execute(interaction) {
        const data = interaction.options.data

        const rawDate = data.filter(e => {
            return e.name == 'birthdate'
        })[0].value

        const dateReg = /^\d{2}([./-])\d{2}\1\d{4}$/

        if(!rawDate.match(dateReg)) {
            interaction.reply({ content: `Per favore inserisci una data corretta`, ephemeral: true })
            return
        }

        const arrayDate = rawDate.split('-').reverse()

        const anno = arrayDate[0]
        const mese = arrayDate[1] - 1
        const giorno = arrayDate[2]

        const birthDate = new Date(anno, mese, giorno)

        await client.birthday.setUserBirthday(interaction.member, birthDate, true)

        interaction.reply({ content: `Il tuo compleanno è stato impostato il \`\`${birthDate.getUTCDate()}-${birthDate.getUTCMonth() + 1}-${birthDate.getUTCFullYear()}\`\`!`, ephemeral: true })
    }
}