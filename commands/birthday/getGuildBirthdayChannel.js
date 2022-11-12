const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const client = require('../../index')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('getbirthdaychannel')
        .setDescription('Mostra il canale dove vengono fatti gli auguri (se esiste)')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    /**
     * @param {import('discord.js').Interaction} interaction 
     */
    async execute(interaction) {
        try {
            const channel = await client.birthday.getGuildBirthdayChannel(interaction.guild)

            interaction.reply(`Il canale per gli auguri è <#${channel.id}>`)
        } catch(e) {
            console.log(e)
        }
    }
}