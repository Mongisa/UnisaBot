const { SlashCommandBuilder, AttachmentBuilder, inlineCode } = require('discord.js')
const levelingSystem = require('../../levelingSystem')
const Canvas = require('discord-canvas')
const ms = require('ms')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rankcard')
        .setDescription('📊 Mostra la tua rankcard nel server')
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

        if(!userData) {
            await interaction.reply({ content: inlineCode('⚠️| Ancora non posseggo informazioni su questo utente!'), ephimeral: true })
            return
        }

        var lvl = 1 //Livello della persona di partenza
        var currEx = process.env.MIN_1LVL * 60 * 1000 //Esperienza della persona di partenza (15 minuti)

        const result = await calcoloLvl(lvl, currEx, userData.Time)

        console.log(result.livello, result.requiredXp, result.tempoCorrente)

        
        const rankCanvas = await new Canvas.RankCard()
        .setAddon('xp', true)
        .setAddon('reputation', false)
        .setAddon('badges', false)
        .setLevel(result.livello)
        .setXP('current', Math.round(result.tempoCorrente/1000))
        .setXP('needed', Math.round(result.requiredXp/1000))
        .setRank(userData.position.toString())
        .setAvatar(user.avatarURL({ forceStatic: true, extension: 'jpg' }))
        .setUsername(username)
        .setBackground('https://4kwallpapers.com/images/walls/thumbs_3t/3104.jpg')
        .toAttachment()

        const attachment = new AttachmentBuilder(rankCanvas.toBuffer(), { name: `rank-${userData.User}.png` })

        interaction.reply({ files: [attachment] })
    }
}

//Funzioni

function calcoloLvl(lvl, currEx, userTime) {
    return new Promise((resolve, reject) => {
        function calcola(lvl,currEx,userTime) {
            if(userTime - currEx > 0) {
                userTime = userTime - currEx
                lvl++;
        
                currEx = currEx + (2/10)*currEx;
        
                calcola(lvl, currEx, userTime)
            } else {
                const result = {
                    "livello": lvl,
                    "tempoCorrente": userTime,
                    "requiredXp": currEx 
                }
                resolve(result)
            }
        }
        
        calcola(lvl, currEx, userTime)
    })
}