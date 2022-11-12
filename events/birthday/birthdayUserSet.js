const client = require('../../index')

client.birthday.on('birthdayUserSet', 
    /**
    * @param {Date} date 
    */
    (member, date) => {
        console.log(`Il compleanno di ${member.user.username} è stato impostato il ${date.toDateString()}`)
    }
)