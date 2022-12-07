const puppeteer = require('puppeteer')
const userSchema = require('../schemas/user-schema')
const process = require('process')

/**
 * @param {String} userId - The user's ID
 * @param {String} guildId - The guild's ID
 */
module.exports.checkSpidLogin = async (userId, guildId) => {
    return new Promise((resolve, reject) => {
        const browser = await puppeteer.launch({headless: true})

        const page = await browser.newPage()
        await page.setViewport({width: 1920, height: 1080})

        await page.goto('https://www.biblioteche.unisa.it/chiedi-al-bibliotecario?richiesta=3');
    
        require('dotenv').config()
        const mongo = require('../mongo')

        await mongo()

        const cookies = await getDatabaseCookies()

        if(!cookies) {
            console.log('No cookies found')
            const imgPath = await generateNewSpidQr(browser, page)

            reject(imgPath)

            await page.waitForNavigation({ timeout: 120000 });
        
            //Manda il messaggio qr su discord

            setDatabaseCookies()

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
    
            if (!data) return resolve(null)
    
            const result = []
    
            data.spidCredentialsCookies.forEach(async (cookie, index) => {
                result.push({})
                for(const key in cookie) {
                    if(typeof cookie[key] == 'string' && key != 'path' && key != 'sourceScheme') {
                        const decrypted = await decrypt(cookie[key])
                        result[index][key] = decrypted
                    } else  {
                        result[index][key] = cookie[key]
                    }
                }
            })
    
            resolve(result)
        } catch(e) {
            reject(e)
        }
    })
}

async function setDatabaseCookies(userId, guildId, cookies) {
    return new Promise(async (resolve, reject) => {
    
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

//Delay function
function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}