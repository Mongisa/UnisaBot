const https = require('https');
const HTMLParser = require('node-html-parser');

const autobusAPI = {
    busitalia: {
        getLines: new Function()
    }
}

autobusAPI.busitalia.getLines = async () => {
    return new Promise((resolve, reject) => {
        https.get('https://www.fsbusitalia.it/content/fsbusitalia/it/campania/orari-e-linee/orari-linee-universitarie-campania.html', (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                const root = HTMLParser.parse(data);
                const lines = [];

                const table = root.querySelector('.contentable ').querySelector('table')

                const rows = table.querySelectorAll('tr')
                
                rows.forEach((row, index) => {
                    if(index == 0) return;

                    const cells = row.querySelectorAll('td');

                    const line = {
                        name: cells[0].querySelector('a').text,
                        link: 'https://www.fsbusitalia.it' + cells[0].querySelector('a').getAttribute('href'),
                        from: cells[1].text,
                        type: cells[2].text,
                    }

                    lines.push(line);
                });

                resolve(lines);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

module.exports = autobusAPI;