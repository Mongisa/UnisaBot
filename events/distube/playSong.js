const distube = require('../../onReadyActions/distube')
const { EmbedBuilder } = require('discord.js')

distube.on('playSong', (queue, song) => {
    const playSongEmbed = new EmbedBuilder()
        .setTitle('🎵 Riproduzione 🎵')
        .setColor('Aqua')
        .setThumbnail(song.thumbnail)
        .setFields(
            { name: '🖹 Titolo', value: song.name },
            { name: '📏 Durata', value: song.formattedDuration, inline: true },
            { name: '👤 Richiesta Da', value: song.member.user.username, inline: true }
        )
        .setTimestamp()

    queue.textChannel.send({ embeds: [playSongEmbed] })
})