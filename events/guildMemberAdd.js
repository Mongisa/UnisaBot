const client = require('../index')
const canvafy = require('canvafy')

client.on('guildMemberAdd', async member => {
    const welcomeChannelId = '1037851808116252704'
    const { user, guild } = member

    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId)
    
    const welcomeCanvas = await new canvafy.WelcomeLeave()
            .setAvatar(member.user.displayAvatarURL({ forceStatic: true, extension: 'png' }))
            .setBackground('color', '#2FF3E0')
            .setTitle('Benvenuto', '#000000')
            .setDescription(`Benvenuto in ${member.guild.name}!`, '#FA26A0')
            .setBorder("#000000")
            .setAvatarBorder("#000000")
            .build()

    welcomeChannel.send({ files: [{ attachment: welcomeCanvas.toBuffer(), name: `welcome-${member.id}.png` }] })

    //Add default role
    /*const baseRoleId = '1038049878984642641'

    const baseRole = member.guild.roles.cache.find(role => role.id === baseRoleId)

    member.roles.add(baseRole)*/

})