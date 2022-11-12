const client = require('../../index')
const birthday = require('../../birthday.json')
const canvafy = require('canvafy')

client.birthday.on('isBirthday', 
    /**
     * @param {import('discord.js').User} user 
     * @param {Array} guilds 
     */
    (user, guilds) => {
        guilds.forEach(async guild => {
            const channelId = birthday.guilds[guild.id].channels

            if(!channelId) return

            const birthdayChannel = guild.channels.cache.get(channelId)

            const birthdayCanvas = await birthdayCanvasCreator(user)

            birthdayChannel.send({ content:`<@${user.id}>`, files: [{ attachment: birthdayCanvas.toBuffer(), name: `birthday-${user.id}.png` }] })
        })
    }

)

/**
 * @param {import('discord.js').User} user 
 */
async function birthdayCanvasCreator(user) {
    return new canvafy.WelcomeLeave()
        .setTitle(`🎂 Auguri ${user.username} 🎂`,'#FFFFFF')
        .setAvatar(user.displayAvatarURL({ forceStatic: true, extension: 'png' }))
        .setBackground('color', '#F69835')
        .setDescription(`Facciamo tanti auguri di buon compleanno a ${user.username}`, '#000000')
        .setBorder("#000000")
        .setAvatarBorder("#000000")
        .build()
}