const autobusAPI = require('./APIs/autobusAPI')

const test = async () => {
    console.log(await autobusAPI.busitalia.getLines())
}

test()