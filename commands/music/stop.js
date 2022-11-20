const { SlashCommandBuilder, inlineCode } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Ferma la musica')
        .setDMPermission(false),
    /**
    * @param {import('discord.js').Interaction} interaction
    **/
    async execute(interaction) {
        const distube = require('../../onReadyActions/distube')
        const queue = distube.getQueue(interaction)

        if(!queue) {
            interaction.reply({ content: `${inlineCode("⚠️| Non sto riproducendo musica!")}`, ephemeral: true })
            return
        }

        distube.stop(interaction)
        interaction.reply({ content: `${inlineCode("⏹️| Musica fermata!")}`, ephemeral: true })
    } 
}