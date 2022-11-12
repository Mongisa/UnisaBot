const client = require('../../index')
const canvafy = require('canvafy')
const guildsSettingsSchema = require('../../schemas/guildsSettings-schema')

client.on('guildMemberAdd', async member => {
    
    const guildId = member.guild.id

    const result = await guildsSettingsSchema.findOne({
        guildId
    })

    if(!result) return

    if(result.welcomeChannelId) {
        const welcomeChannelId = result.welcomeChannelId

        const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId)

        if(!welcomeChannel) return new Error('Welcome channel not found on Discord')
    
        const welcomeCanvas = await new canvafy.WelcomeLeave()
            .setAvatar(member.user.displayAvatarURL({ forceStatic: true, extension: 'png' }))
            .setBackground('color', '#2FF3E0')
            .setTitle(`Benvenuto/a ${member.user.username}`, '#000000')
            .setDescription(`Benvenuto in ${member.guild.name}!`, '#FA26A0')
            .setBorder("#000000")
            .setAvatarBorder("#000000")
            .build()

        welcomeChannel.send({ content:`<@${member.id}>`, files: [{ attachment: welcomeCanvas.toBuffer(), name: `welcome-${member.id}.png` }] })
    }

    if(result.baseRoleId) {
        //Add default role
        const baseRoleId = result.baseRoleId

        const baseRole = member.guild.roles.cache.find(role => role.id === baseRoleId)

        member.roles.add(baseRole)
    }

})