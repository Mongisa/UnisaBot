const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const client = require('../../index')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('compleanno')
        .setDescription('Mostra la data di compleanno di un utente')
        .setDMPermission(false)
        .addUserOption(option =>
            option
                .setName('userid')
                .setDescription(`L'id dell'utente di cui vuoi inserire il compleanno`)
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

        const user = interaction.guild.members.cache.get(userId).user

        if(user.bot) {
            interaction.reply({ content: `\`\`Non è possibile impostare il compleanno di un bot\`\``, ephemeral: true })
            return
        }

        try {
            const birthday = await client.birthday.getUserBirthday(user)

            if(!birthday) {
                interaction.reply(`Il compleanno di **${user.nickname||user.username}** non è stato impostato. Usa /setuserbirthday`)
                return
            }

            const birthdayEmbed = await buildBirthdayEmbed(birthday)

            interaction.reply({ embeds: [birthdayEmbed] })
        } catch(e) {
            interaction.reply(`Si è verificato un errore durante la creazione dell'Embed`)
        }

    }
}

/**
 * 
 * @param {Object} birthday 
 */
async function buildBirthdayEmbed(birthday) {
    return new EmbedBuilder()
        .setTitle('📅 Informazioni Compleanno 📅')
        .setThumbnail(birthday.user.avatarURL())
        .setColor('Red')

        .setFields(
            { name: 'Username', value: birthday.user.nickname || birthday.user.username },
            { name: 'Anni', value: birthday.age.toString() },
            { name: 'Prossimo compleanno', value: `${birthday.nextBirthday.getUTCDate()}-${birthday.nextBirthday.getUTCMonth() + 1}-${birthday.nextBirthday.getUTCFullYear()}` },
            { name: 'Giorni Rimanenti', value: birthday.daysBeforeNext.toString() }
        )

        .setTimestamp()
}