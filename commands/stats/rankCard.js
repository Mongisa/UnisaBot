const { SlashCommandBuilder, AttachmentBuilder, inlineCode } = require('discord.js')
const levelingSystem = require('../../levelingSystem')
const Canvas = require('discord-canvas')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rankcard')
        .setDescription('📊 Mostra la tua rankcard nel server')
        .setDMPermission(false)
        .addUserOption(option => option.setName('user').setDescription('Utente da mostrare')),
    /**
     * @param {import('discord.js').Interaction} interaction
     */
    async execute(interaction) {
        const user = interaction.guild.members.cache.get(interaction.options.getUser('user')?.id)?.user || interaction.user
        const userId = user.id
        const guildId = interaction.guildId
        const username = user.username

        const userData = await levelingSystem.getUserData(guildId, userId)
        const xpData = await levelingSystem.calculateUserLvl(guildId, userId)

        if(!userData || !xpData) {
            await interaction.reply({ content: inlineCode('⚠️| Ancora non posseggo informazioni su questo utente!'), ephimeral: true })
            return
        }
        
        const rankCanvas = await new Canvas.RankCard()
        .setAddon('xp', true)
        .setAddon('reputation', false)
        .setAddon('badges', false)
        .setLevel(xpData.livello)
        .setXP('current', Math.round(xpData.tempoCorrente/1000))
        .setXP('needed', Math.round(xpData.requiredXp/1000))
        .setRank(userData.position.toString())
        .setAvatar(user.avatarURL({ forceStatic: true, extension: 'jpg' }))
        .setUsername(username)
        .setBackground('https://4kwallpapers.com/images/walls/thumbs_3t/3104.jpg')
        .toAttachment()

        const attachment = new AttachmentBuilder(rankCanvas.toBuffer(), { name: `rank-${userData.User}.png` })

        interaction.reply({ files: [attachment] })
    }
}