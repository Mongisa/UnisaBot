const puppeteer = require('puppeteer')
const userSchema = require('../schemas/user-schema')
const process = require('process')
const CryptoJS = require('crypto-js')
const { AttachmentBuilder, inlineCode } = require('discord.js')

/**
 * @param {String} userId - The user's ID
 * @param {String} guildId - The guild's ID
 * @param {import('discord.js').Interaction} interaction - The interaction object
 */
module.exports.checkSpidLogin = async (userId, guildId, interaction) => {
    return new Promise(async (resolve, reject) => {
        const browser = await puppeteer.launch({headless: true})

        const page = await browser.newPage()
        await page.setViewport({width: 1920, height: 1080})

        await page.goto('https://www.biblioteche.unisa.it/chiedi-al-bibliotecario?richiesta=3');

        const cookies = await getDatabaseCookies(userId, guildId)

        if(!cookies) {
            const qrCodePath = await generateNewSpidQr(browser, page)
            const attachment = new AttachmentBuilder()
            .setFile(qrCodePath)
            .setName('qrCode.png')

            await interaction.editReply({content: 'Per favore scansiona il qr per eseguire l\'accesso', files: [attachment], epehemeral: true })

            try {
                await page.waitForNavigation({ timeout: 120000 });

                await interaction.editReply({content: inlineCode("Loading..."), epehemeral: true, files: [] })

                await page.click('.btn-primary')
                await page.waitForNavigation();
                await delay(2000)
                const cookies = await page.cookies()

                await setDatabaseCookies(userId, guildId, cookies)

                try {
                    const result = await validateLogin(page, cookies)
                    resolve(result)
                } catch(e) {
                    await userSchema.findOneAndUpdate({
                        userId: userId,
                        guildId: guildId
                    },{
                        userId: userId,
                        guildId: guildId,
                        spidCredentialsCookies: null
                    }, {
                        upsert: true,
                        new: true
                    })

                    reject(e)
                }
            } catch(e) {
                reject(e)
            }
        } else {
            try {
                const result = await validateLogin(page, cookies)
                resolve(result)

                await browser.close()
            } catch(e) {
                await userSchema.findOneAndUpdate({
                    userId: userId,
                    guildId: guildId
                },{
                    userId: userId,
                    guildId: guildId,
                    spidCredentialsCookies: null
                }, {
                    upsert: true,
                    new: true
                })

                reject(e)

                await browser.close()
            }
        }
    })
    
}

module.exports.getAvailableDays = async () => {
    
}

//Functions
/**
 * @param {String} userId - The user's ID 
 * @param {String} guildId - The guild's ID
 * @returns {Object} - The user's credentials
 */
async function getDatabaseCookies(userId, guildId) {
    return new Promise(async (resolve, reject) => {
        try {
            const data = await userSchema.findOne({
                userId: userId,
                guildId: guildId
            })
    
            if (!data || !data.spidCredentialsCookies || data.spidCredentialsCookies.length === 0) {
                resolve(null)
                return
            }

            const decryptedCookies = await decryptCookies(data.spidCredentialsCookies)
    
            resolve(decryptedCookies)
        } catch(e) {
            reject(e)
        }
    })
}

async function setDatabaseCookies(userId, guildId, cookies) {
    return new Promise(async (resolve, reject) => {
        try {
            const encryptedCookies = await encryptCookies(cookies)

            await userSchema.findOneAndUpdate({
                userId: userId,
                guildId: guildId
            },{
                userId: userId,
                guildId: guildId,
                spidCredentialsCookies: encryptedCookies
            }, {
                upsert: true,
                new: true
            })

            resolve()
        } catch(e) {
            reject(e)
        }
    })
}

async function validateLogin(page, cookies) {
    return new Promise(async (resolve, reject) => {
        try {
            for (let cookie of cookies) {
                await page.setCookie(cookie);
            }
    
            await page.goto('https://www.biblioteche.unisa.it/chiedi-al-bibliotecario?richiesta=3');
    
            const titolo = await page.title()
    
            if(titolo == 'Spazio di Ateneo') {
                resolve()
            } else {
                reject("EXPIRED")
            }
        } catch(e) {
            reject(e)
        }
    })
}

/**
 * @param {import('puppeteer').Browser} browser - The browser object
 * @param {import('puppeteer').Page} page - The page to generate the QR code
 * @returns {Object} - SPID cookies
 */
async function generateNewSpidQr(browser, page) {
    return new Promise(async (resolve, reject) => {
        try {
            await page.click('.nav-link ');
            await delay(3000)
            await page.click('.button-spid')
            await delay(1000)
            await page.click('li[data-idp="posteid"]');
            await page.waitForNavigation();
            await delay(1000)

            const qrCode = await page.evaluate(() => {
                return document.querySelector('img[id="qr"]').getAttribute('src')
            })

            const qrPage = await browser.newPage();
            await qrPage.setViewport({ width: 200, height: 200, deviceScaleFactor: 1 });
            await qrPage.goto(qrCode);
            const imgPath = process.cwd() + '/spidQr.png'
            await qrPage.screenshot({ path: imgPath });
            await qrPage.close();
            resolve(imgPath)
        } catch(e) {
            reject(e)
        }
    })
}

//Encrypt and Decrypt functions

async function encrypt(string) {
    return CryptoJS.AES.encrypt(string, process.env.CRYPTO_KEY).toString();
}
  
async function decrypt(string) {
    var bytes  = CryptoJS.AES.decrypt(string, process.env.CRYPTO_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}

async function encryptCookies(cookies) {
    return new Promise((resolve, reject) => {
        const encryptedCookies = []

        cookies.forEach(async (cookie, index) => {
            encryptedCookies.push({})
            for(const key in cookie) {
                if(typeof cookie[key] == 'string' && key != 'path' && key != 'sourceScheme') {
                    const encrypted = await encrypt(cookie[key])
                    encryptedCookies[index][key] = encrypted

                    if(index == cookies.length - 1) resolve(encryptedCookies)

                } else  {
                    encryptedCookies[index][key] = cookie[key]

                    if(index == cookies.length - 1) resolve(encryptedCookies)
                }
            }
        })
    })
}

async function decryptCookies(cookies) {
    return new Promise((resolve, reject) => {
        const decryptedCookies = []

        cookies.forEach(async (cookie, index) => {
            decryptedCookies.push({})
            for(const key in cookie) {
                if(typeof cookie[key] == 'string' && key != 'path' && key != 'sourceScheme') {
                    const decrypted = await decrypt(cookie[key])
                    decryptedCookies[index][key] = decrypted

                    if(index == cookies.length - 1) resolve(decryptedCookies)

                } else  {
                    decryptedCookies[index][key] = cookie[key]

                    if(index == cookies.length - 1) resolve(decryptedCookies)
                }
            }
        })
    })
}
//Delay function
function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}