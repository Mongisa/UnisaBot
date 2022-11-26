const { bold, inlineCode } = require('discord.js')
const slapsSchema = require('../../schemas/slaps-schema')

module.exports = {
    type: 2,
    name: 'Schiaffeggia',
    /**
     * @param {import('discord.js').Interaction} interaction 
     */
    async execute(interaction) {
        const targetUserId = interaction.targetId
        const targetUsername = interaction.guild.members.cache.get(targetUserId).user.username
        const guildId = interaction.guild.id

        if(interaction.guild.members.cache.get(targetUserId).user.bot) {
            interaction.reply({ content: inlineCode(`⚠️| Non puoi schiaffeggiare un bot!`), ephemeral: true })
            return
        }

        const result = await slapsSchema.findOne({
            userId: targetUserId
        })

        var data

        if(!result || !result.data) {
            data = {}
            data[guildId] = 1
        } else if(!result.data[guildId]) {
            data = result.data
            data[guildId] = 1
        } else {
            data = result.data
            data[guildId]++
        }

        await slapsSchema.findOneAndUpdate({
            userId: targetUserId
        },{
            userId: targetUserId,
            username: targetUsername,
            data
        },{
            upsert: true,
            new: true
        })

        const dm = await interaction.guild.members.cache.get(targetUserId).createDM()

        if(interaction.user.id == targetUserId) {
            dm.send('Ti sei schiaffeggiato da solo, complimentoni!')
        } else {
            dm.send(`Sei stato schiaffeggiato da ${bold(interaction.user.username)}`)
        }

        interaction.reply({ content: inlineCode(`✅| ${bold(targetUsername)} è stato schiaffeggiato`), ephemeral: true })
    }
}