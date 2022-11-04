const client = require('../index')
const { EmbedBuilder } = require('discord.js')

client.on('guildMemberAdd', (member) => {
    const welcomeChannelId = '1037851808116252704'
    const { user, guild } = member

    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId)

    const welcomeEmbed = new EmbedBuilder()
        .setColor('Random')
        .setTitle(`${user.username} si è appena unito al server`)
        .setDescription(`Benvenuto <@${user.id}> nel server ${member.guild.name}! 😁`)
        .addFields(
            { name: 'Membri Totali', value: member.guild.memberCount.toString() }
        )
        .setThumbnail(member.user.avatarURL())
        .setTimestamp()
    
    welcomeChannel.send({ embeds: [welcomeEmbed] })

    //Add default role
    const baseRoleId = '1038049878984642641'

    const baseRole = member.guild.roles.cache.find(role => role.id === baseRoleId)

    member.roles.add(baseRole)

})