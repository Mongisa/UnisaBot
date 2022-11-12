const client = require('../../index')
const userSchema = require('../../schemas/user-schema')

client.on('messageCreate', async msg => {
    
    if(msg.author.bot) return

    const guildId = msg.guildId
    const guildName = msg.guild.name
    const userId = msg.author.id
    const username = msg.author.username

    await userSchema.findOneAndUpdate({
        guildId,
        userId,
    },{
        guildId,
        guildName,
        userId,
        username,
        $inc: {
            totalMessagesSent: 1
        }
    },{
        upsert: true,
        new: true
    })
})