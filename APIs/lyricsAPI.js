const lyrics = require('music-lyrics')

/**
 * @param {String} songName - Nome della canzone 
 * @returns 
 */
module.exports = (songName) => {
    return new Promise( async(resolve, reject) => {
        try {
            const lyric = await lyrics.search(songName)
            resolve(lyric.toString())
        } catch (error) {
            reject(error)
        }
    })
}