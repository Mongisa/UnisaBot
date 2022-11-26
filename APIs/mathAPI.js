const https = require('https')

/**
 * 
 * @param {String} expression Espressione da derivare
 */
module.exports.derive = (expression) => {
    return new Promise((resolve, reject) => {
        https.get(`https://newton.vercel.app/api/v2/derive/${encodeURI(expression)}`, (res) => {
            let data = ''
            res.on('data', (chunk) => {
                data += chunk
            })
            res.on('end', () => {
                resolve(JSON.parse(data))
            })
        }).on('error', (err) => {
            reject(err)
        })
    })
}