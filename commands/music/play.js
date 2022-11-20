const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Riproduce una canzone')
        .setDMPermission(false)
        .addStringOption(option =>
            option
                .setName('song')
                .setDescription('La canzone da riprodurre')
                .setRequired(true)
        ),
    /**
     * @param {import('discord.js').Interaction} interaction 
     */
    async execute(interaction) {
        const distube = require('../../onReadyActions/distube')
        const voiceChannel = interaction.member.voice.channel

        if(!voiceChannel) {
            interaction.reply({ content: 'Devi essere in un canale vocale per usare questo comando', ephemeral: true })
            return
        }

        const song = interaction.options.get('song').value

        distube.play(voiceChannel, song, { textChannel: interaction.channel, autoplay: false, hq: true, member: interaction.member, bitrate: 320000 })

        await interaction.reply('✔️')
        interaction.deleteReply()
    }
}