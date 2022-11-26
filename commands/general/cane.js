const { SlashCommandBuilder, inlineCode } = require('discord.js')
const https = require('https')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cane')
        .setDescription('🐕 Mando foto carine di cani'),

        /**
        * @param {import('discord.js').Interaction} interaction 
        */
        async execute(interaction) {
            https.get('https://dog.ceo/api/breeds/image/random', resp => {
                let data = ''

                resp.on('data', chunck => {
                    data += chunck
                })

                resp.on('end', () => {
                    interaction.reply(JSON.parse(data).message)
                }).on('error', err => {
                    interaction.reply({ content: inlineCode(`⚠️| Si è vericato un errore con l'API`), ephimeral: true })
                })
            })
        }
}