//Questio script avvia l'estensione Distube per riprodurre musica
const client = require('../index')
const Distube = require('distube')
const { SpotifyPlugin } = require('@distube/spotify')
require('ffmpeg-static')

module.exports = async () => {
    const distube = new Distube.default(client, {
        leaveOnFinish: true,
        emitNewSongOnly: true,
        emitAddSongWhenCreatingQueue: false,
        plugins: [new SpotifyPlugin({
            emitEventsAfterFetching: true
        })]
    })

    module.exports = distube

    console.log('Distube loaded')
}