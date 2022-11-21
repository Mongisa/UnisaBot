const distube = require('../../onReadyActions/distube')
const { EmbedBuilder } = require('discord.js')

distube.on('addSong', (queue, song) => {
    const addSongEmbed = new EmbedBuilder()
        .setTitle('🎵 Aggiunta alla coda 🎵')
        .setColor('#90EE90')
        .setThumbnail(song.thumbnail)
        .setFields(
            { name: '🖹 Titolo', value: song.name },
            { name: '📏 Durata', value: song.formattedDuration, inline: true },
            { name: '👤 Richiesta Da', value: song.member.user.username, inline: true }
        )
        .setTimestamp()

    queue.textChannel.send({ embeds: [addSongEmbed] })
})