const { SlashCommandBuilder, ChannelType } = require('discord.js')
const client = require('../../index')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setbirthdaychannel')
        .setDescription('Imposta il canale dove mandare gli auguri di compleanno')
        .setDMPermission(false)
        .addChannelOption(option => 
            option
                .setName('channelid')
                .setDescription('Id del canale')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)    
        ),
    /**
     * @param {import('discord.js').Interaction} interaction 
     */
    async execute(interaction) {
        const data = interaction.options.data

        const channelId = data.filter(e => {
            return e.name == 'channelid'
        })[0].value

        const channel = interaction.guild.channels.cache.get(channelId)

        try {
            await client.birthday.setGuildBirthdayChannel(channel)
        } catch(e) {
            interaction.reply('Si è verificato un errore generico')
            return
        }

        interaction.reply({ content: `<#${channelId}> è il canale per gli auguri di compleanno`, ephemeral: true })
    }
}