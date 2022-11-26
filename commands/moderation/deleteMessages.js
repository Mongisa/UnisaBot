const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('❌ Cancella i messaggi nella chat dove viene utilizzato il comando')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setDMPermission(false)

        .addNumberOption(option =>
            option
                .setName('numero')
                .setDescription('🔢 Numero di messaggi da eliminare')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        ),

    /**
    * @param {import('discord.js').Interaction} interaction 
    */
    async execute(interaction) {
        const chatId = interaction.channel.id
        const number = interaction.options.data[0].value

        try {
            await interaction.guild.channels.cache.get(chatId).bulkDelete(number)
        } catch (error) {
            console.log(error)
        }

        await interaction.reply({ content: inlineCode(`✅|Messaggi Eliminati [${number}]`), ephemeral: true })
    }
}