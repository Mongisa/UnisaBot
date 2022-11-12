const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const client = require('../../index')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deactivateuserbirthday')
        .setDescription(`Disattiva l'avviso di compleanno per il membro selezionato`)
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option
                .setName('userid')
                .setDescription(`L'id dell'utente di cui vuoi disattivare gli auguri`)
                .setRequired(true) 
        ),
    /**
     * @param {import('discord.js').Interaction} interaction
     * @param {import('discord-birthday').Client} client
     */
    async execute(interaction) {
        const data = interaction.options.data

        const userId = data.filter(e => {
            return e.name == 'userid'
        })[0].value

        const member = interaction.guild.members.cache.get(userId)

        if(member.user.bot) {
            interaction.reply({ content: `\`\`Non è possibile impostare il compleanno di un bot\`\``, ephemeral: true })
            return
        }

        try {
            await client.birthday.deactivateMemberBirthday(member)
        } catch(e) {
            if(e) {
                interaction.reply(`Non ci sono avvisi di compleanno per ${member.nickname || member.user.username}`)
            }

            return
        }

        interaction.reply({ content: `Le notifiche per il compleanno di **${member.nickname || member.user.username}** sono state disattivate`, ephemeral: true })
    }
}