const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, PermissionsBitField, inlineCode } = require('discord.js')
const guildsSettingsSchema = require('../../schemas/guildsSettings-schema')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('canalecontatoremembri')
        .setDescription('Imposta il canale vocale con il contatore dei membri del server')
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option
                .setName('canale')
                .setDescription('Contatore dei membri del server (se non impostato, il contatore verrà disabilitato)')
                .addChannelTypes(ChannelType.GuildVoice)
        ),
    /**
     * @param {import('discord.js').Interaction} interaction
     */
    async execute(interaction) {
        const guildId = interaction.guildId
        const channel = interaction.options.getChannel('canale')

        //Aggiorna database
        await guildsSettingsSchema.findOneAndUpdate({
            guildId
        }, {
            guildId,
            guildName: interaction.guild.name,
            memberCountChannel: {
                channelId: channel ? channel.id : null,
                name: channel ? `👥 Membri: [_num_]` : null
            }
        }, {
            upsert: true
        })

        if(!channel) {
            await interaction.reply({ content: inlineCode("⚠️| Canale vocale con il contatore dei membri del server disabilitato"), ephemeral: true })
            return
        }

        //Imposta canale vocale con il contatore dei membri del server
        const channelObj = interaction.guild.channels.cache.get(channel.id)
        
        await channelObj.setName(`👥 Membri: [${interaction.guild.memberCount}]`)
        await channelObj.permissionOverwrites.set([
            {
                id: interaction.guild.roles.everyone,
                deny: [PermissionsBitField.Flags.Connect, PermissionsBitField.Flags.SendMessages]
            }
        ])

        await interaction.reply({ content: `${inlineCode("✅| Canale vocale con il contatore dei membri del server impostato su")} <#${channel.id}>`, ephemeral: true })
            
    }
}