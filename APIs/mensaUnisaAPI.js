const https = require('https')
const HTMLParser = require('node-html-parser')
const fs = require('fs')

/**
 * 
 * @returns {Promise} Promise object represents the response from the API
 */
module.exports.getLunch = () => {
    return new Promise((resolve, reject) => {
        https.get(`https://www.adisurcampania.it/archivio2_aree-tematiche_0_8.html`, (res) => {
            let data = ''
            res.on('data', (chunk) => {
                data += chunk
            })
            res.on('end', async () => {
                const root = HTMLParser.parse(data)

                const result = root.querySelectorAll('a').filter((a) => {
                    return a.text.includes('Pranzo') || a.text.includes('pranzo')
                }).map((a) => {
                    return {
                        name: a.text,
                        link: a.getAttribute('href')
                    }
                })

                resolve(result[0])
            })
        }).on('error', (err) => {
            reject('Error: ' + err.message)
        })
    })
}

module.exports.getDinner = () => {
    return new Promise((resolve, reject) => {
        https.get(`https://www.adisurcampania.it/archivio2_aree-tematiche_0_8.html`, (res) => {
            let data = ''
            res.on('data', (chunk) => {
                data += chunk
            })
            res.on('end', async () => {
                const root = HTMLParser.parse(data)

                const result = root.querySelectorAll('a').filter((a) => {
                    return a.text.includes('Cena') || a.text.includes('cena')
                }).map((a) => {
                    return {
                        name: a.text,
                        link: a.getAttribute('href')
                    }
                })
                
                resolve(result[0])
            })
        }).on('error', (err) => {
            reject('Error: ' + err.message)
        })
    })
}