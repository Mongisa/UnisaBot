const client = require('../../index')
const guildsSettingsSchema = require('../../schemas/guildsSettings-schema')
const { AttachmentBuilder } = require('discord.js')
const Canvas = require('discord-canvas')

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
    
        const welcomeCanvas = await new Canvas.Welcome()
            .setUsername(member.user.username)
            .setAvatar(member.user.avatarURL({ forceStatic: true, extension: 'jpg' }))
            .setBackground('https://img.freepik.com/free-vector/sparkling-golden-stars-confetti-burst-background_1017-32368.jpg')
            .setGuildName(member.guild.name)
            .setMemberCount(member.guild.memberCount)
            .setDiscriminator(member.user.discriminator)
            .setText('Title', 'BENVENUTO!')
            .setText('Message', 'Benvenuto nel server {server}')
            .toAttachment()

        const attachment = new AttachmentBuilder(welcomeCanvas.toBuffer(), { name: `welcome-${member.id}.png` })

        welcomeChannel.send({ content:`<@${member.id}>`, files: [attachment] })
    }

    //Assegna il ruolo di default
    if(result.defaultRoleId) {

        const defaultRoleId = result.defaultRoleId

        const defaultRole = member.guild.roles.cache.find(role => role.id === defaultRoleId)

        member.roles.add(defaultRole)
    }

})
