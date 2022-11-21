const distube = require('../../onReadyActions/distube')
const { EmbedBuilder } = require('discord.js')

distube.on('playSong', (queue, song) => {
    const playSongEmbed = new EmbedBuilder()
        .setTitle('🎵 Riproduzione 🎵')
        .setColor('#90EE90')
        .setThumbnail(song.thumbnail)
        .setFields(
            { name: '🖹 Titolo', value: song.name },
            { name: '📏 Durata', value: song.formattedDuration, inline: true },
            { name: '👤 Richiesta Da', value: song.member.user.username, inline: true },
            { name: '🔗 Link', value: song.url }
        )
        .setTimestamp()

    queue.textChannel.send({ embeds: [playSongEmbed] })
})