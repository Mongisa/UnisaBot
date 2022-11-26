const client = require('../../index')
const canvafy = require('canvafy')
const guildsSettingsSchema = require('../../schemas/guildsSettings-schema')

client.on('guildMemberAdd', async member => {
    
    const guildId = member.guild.id

    const result = await guildsSettingsSchema.findOne({
        guildId
    })

    if(!result) return

    //Benvenuto
    if(result.welcomeChannelId) {
        const welcomeChannelId = result.welcomeChannelId

        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId)

        if(!welcomeChannel) return new Error('Welcome channel not found on Discord')
    
        const welcomeCanvas = await new canvafy.WelcomeLeave()
            .setAvatar(member.user.displayAvatarURL({ forceStatic: true, extension: 'png' }))
            .setTitle(`Benvenuto/a ${member.user.username}`, '#000000')
            .setDescription(`Benvenuto in ${member.guild.name}!`, '#FA26A0')
            .setBorder("#000000")
            .setAvatarBorder("#000000")

            if(member.displayHexColor && member.displayHexColor !== '#000000') {
                welcomeCanvas.setColor('color', member.displayHexColor)
            } else {
                welcomeCanvas.setBackground('color', '#2FF3E0')
            }

            welcomeCanvas.build()

        welcomeChannel.send({ content:`<@${member.id}>`, files: [{ attachment: welcomeCanvas.toBuffer(), name: `welcome-${member.id}.png` }] })
    }

    //Assegna il ruolo di default
    if(result.defaultRoleId) {

        const defaultRoleId = result.defaultRoleId

        const defaultRole = member.guild.roles.cache.find(role => role.id === defaultRoleId)

        member.roles.add(defaultRole)
    }

})
