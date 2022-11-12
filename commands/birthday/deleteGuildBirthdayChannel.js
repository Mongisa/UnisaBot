const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const client = require('../../index')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deletebirthdaychannel')
        .setDescription('Elimina il canale dove vengono fatti gli auguri (se esiste)')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    /**
     * @param {import('discord.js').Interaction} interaction 
     */
    async execute(interaction) {
        try {
            await client.birthday.deleteGuildBirthdayChannel(interaction.guild)

            interaction.reply(`Il canale per gli auguri è stato eliminato`)
        } catch(e) {
            console.log(e)
        }
    }
}