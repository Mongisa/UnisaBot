const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const client = require('../../index')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('activateuserbirthday')
        .setDescription(`Attiva l'avviso di compleanno per il membro selezionato`)
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option
                .setName('userid')
                .setDescription(`L'id dell'utente di cui vuoi attivare gli auguri`)
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
            await client.birthday.activateMemberBirthday(member)
        } catch(e) {
            if(e) {
                interaction.reply({ content : `Gli avvisi di compleanno sono già attivati per l'utente`, ephemeral: true })
            }

            return
        }

        interaction.reply({ content: `Le notifiche per il compleanno di **${member.nickname || member.user.username}** sono state attivate`, ephemeral: true })
    }
}