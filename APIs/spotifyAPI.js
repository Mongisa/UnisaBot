const SpotifyWebApi = require('spotify-web-api-node');
const botSettingsSchema = require('../schemas/botSettings-schema')
const request = require('request');
var CryptoJS = require("crypto-js");

const spotifyApi = new SpotifyWebApi();

require('dotenv').config()

const client_id = process.env.SPOTIFY_CLIENT_ID; // Your client id
const client_secret = process.env.SPOTIFY_CLIENT_SECRET; // Your secret

retrieveToken()

/**
 * @param {String} query - The search query 
 * @param {Number} limit - The number of results to return (default è 10)
 */
module.exports.searchTracks = async(query, limit = 10) => {
  return spotifyApi.searchTracks(query, { limit: limit }).then(data => {
    return data.body.tracks.items;
  }, err => {
    console.error(err);
  });
}

//Local Functions
async function generateNewToken() {
  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
  };
  
  request.post(authOptions, async function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var token = await body.access_token;
      token = await encrypt(token);
      const expires_in = await body.expires_in;

      var expires_date = new Date();

      expires_date.setSeconds(expires_date.getSeconds() + expires_in);

      await botSettingsSchema.findOneAndUpdate({
        name: 'spotify token'
      },{
        name: 'spotify token',
        token: token,
        expires_in: expires_in,
        expires_date: expires_date
      },{
        upsert: true
      });
    }
  });
}

async function retrieveToken() {
  const data = await botSettingsSchema.findOne({
    name: 'spotify token'
  })

  if(!data || new Date(data.expires_date) < new Date()) {
    await generateNewToken();
    return await retrieveToken();
  }

  const token = await decrypt(data.token);

  spotifyApi.setAccessToken(token);
}

async function encrypt(string) {
  return CryptoJS.AES.encrypt(string, process.env.CRYPTO_KEY).toString();
}

async function decrypt(string) {
  var bytes  = CryptoJS.AES.decrypt(string, process.env.CRYPTO_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}