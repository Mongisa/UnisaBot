const { SlashCommandBuilder, PermissionFlagsBits, inlineCode } = require('discord.js')
const guildsSettingsSchema = require('../../schemas/guildsSettings-schema')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('defaultrole')
        .setDescription('👤 Ruolo che viene assegnato automaticamente quando un utente si unisce al server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)
        .addRoleOption(option => 
            option
                .setName('defaultroleid')
                .setDescription(`Il ruolo da assegnare (lascia voto questo campo per disabilitare l'opzione)`)    
        ),
    /**
    * @param {import('discord.js').Interaction} interaction 
    */
    async execute(interaction) {
        const guildId = interaction.guildId

        const data = interaction.options.data.filter(e => {
            return e.name == 'defaultroleid'
        })

        var defaultRoleId = null

        if(data.length) {
            defaultRoleId = data[0].value
        }

        await guildsSettingsSchema.findOneAndUpdate({
            guildId
        },{
            guildId,
            defaultRoleId
        },{
            upsert: true,
            new: true
        })

        if(defaultRoleId) {
            interaction.reply({ content: `${inlineCode('✅|')} <@&${interaction.guild.roles.cache.get(defaultRoleId).id}> ${inlineCode('verrà assegnato a tutti i nuovi membri')}`, ephemeral: true })
        } else {
            interaction.reply({ content: inlineCode(`❌| La funzione di aggiunta ruolo è stata disabilitata`), ephemeral: true })
        }
    }
}