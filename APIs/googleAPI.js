const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

const alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']

const diemSheetId = '1c-TNlFLSoqJPGZlEP5dQ1x-9fEUxQN2oV8wrohD3nBE'

/**
 * 
 * @returns {Promise<Object>} - Ritorna un oggetto con le date di tutti gli esami.
 */
module.exports.getDiemDates = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const calendar = await formatSpreadsheetData(diemSheetId, 'Table 1!A3:I55', 3)
      resolve(calendar)
    } catch(error) {
      reject(error)
    }
  })
}

//Functions
/**
 * 
 * @param {String} spreadsheetId - The ID of the spreadsheet to retrieve data from. 
 * @param {*} range - The A1 notation of the values to retrieve.
 * @param {*} dateLocation - Posizione all'interno dell'Array dal quale ci sono le date.
 */
async function formatSpreadsheetData (spreadsheetId, range, dateLocation) {
  return new Promise(async (resolve, reject) => {
    const client = await authorize()
    const sheets = google.sheets({ version: 'v4', auth: client })

    try {
      const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range
      })

      const data = res.data.values
      const calendar = {} 

      data.forEach((row, i1) => {
        var obj = calendar
        row.forEach((cell, i2) => { 
          if(i2 >= dateLocation || cell != '') {
            if(i2 < dateLocation - 1) {
              obj[cell] = {}
              obj = obj[cell]
            } else if(i2 == dateLocation - 1) {
              obj[cell] = { dates: [] }
              obj = obj[cell]
            } else {
              obj.dates.push(cell || '')
            }

          } else {

            var sub = 1

            while(data[i1 - sub][i2] == '') {
              sub++
            }

            obj = obj[data[i1 - sub][i2]]
          }
        })
    
      })
  
      resolve(calendar)
    } catch (error) {
      reject('Errore Google Spreadsheet API')
    }
  })
}

//Auth Functions

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'GoogleCredentials.json');

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

/**
 * Load or request or authorization to call APIs.
 *
 */
async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}