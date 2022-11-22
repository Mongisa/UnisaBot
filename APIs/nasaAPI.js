require('dotenv').config()
const https = require('https')
const cacheSchema = require('../schemas/cache-schema')

const token = process.env.NASA_TOKEN

module.exports.pictureOfTheDay = () => {
    return new Promise(async (resolve, reject) => {
        //Controlla se la foto è presente nella cache di MongoDB
        const data = await cacheSchema.findOne({ cacheId: 'nasa' })
        const nowDateString = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`

        if(data && data.pod && data.pod.date === nowDateString) {
            resolve(data.pod)
            return
        }

        //Se non è presente, scaricala da NASA e salvala nella cache di MongoDB
        const options = {
            hostname: 'api.nasa.gov',
            path: `/planetary/apod?api_key=${token}`,
            method: 'GET'
        }

        const req = https.request(options, res => {
            let data = ''

            res.on('data', chunk => {
                data += chunk
            })

            res.on('end', async () => {
                resolve(JSON.parse(data))

                await cacheSchema.findOneAndUpdate({
                    cacheId: 'nasa'
                },{
                    cacheId: 'nasa',
                    pod: JSON.parse(data)
                },{
                    upsert: true
                })
            })
        })

        req.on('error', error => {
            reject(error)
        })

        req.end()
    })
}