const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi();

require('dotenv').config()

const request = require('request');
const client_id = process.env.SPOTIFY_CLIENT_ID; // Your client id
const client_secret = process.env.SPOTIFY_CLIENT_SECRET; // Your secret


var authOptions = {
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
    const token = body.access_token;
    spotifyApi.setAccessToken(token)
  }
});

/**
 * @param {String} query - The search query 
 * @param {Number} limit - The number of results to return (default è 10)
 */
module.exports.searchTracks = (query, limit = 10) => {
    return spotifyApi.searchTracks(query, { limit: limit }).then(data => {
        return data.body.tracks.items;
    }, err => {
        console.error(err);
    });
}