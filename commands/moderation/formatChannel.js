const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, inlineCode } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('formatchannel')
        .setDescription('🖌️ Formatta sia i canali vocali che testuali')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false)

        //CHAT TESTUALE
        .addSubcommand(subcommand => 
            subcommand
                .setName('text')
                .setDescription('🔤 Modifica il nome una chat testuale')
                .addChannelOption(channel => 
                    channel
                        .setName('channel')
                        .setDescription('Il canale testuale che vuoi modificare')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(true)
                )
                .addStringOption(option => 
                    option
                        .setName('emoji')
                        .setDescription(`L'emoji da inserire prima del nome`)
                        .setRequired(true)
                )
        )

        //CHAT VOCALE
        .addSubcommand(subcommand =>
            subcommand
                .setName('voice')
                .setDescription('🎤 Modifica il nome una chat vocale')
                .addChannelOption(channel => 
                    channel
                        .setName('channel')
                        .setDescription('Il canale vocale che vuoi modificare')
                        .addChannelTypes(ChannelType.GuildVoice)
                        .setRequired(true)
                )
                .addStringOption(option => 
                    option
                        .setName('emoji')
                        .setDescription(`L'emoji da inserire prima del nome`)
                        .setRequired(true)
                )
        ),
    /**
    * @param {import('discord.js').Interaction} interaction 
    */
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand()

        const emoji = interaction.options.get('emoji').value
        const regexExp = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/gi

        //Verifica se è stata immessa un'emoji
        if(!regexExp.test(emoji)) {
            interaction.reply({ content: `${inlineCode("⚠️| L'emoji inserita non è corretta")}`, ephemeral: true })
            return
        }

        const channelName = interaction.options.get('channel').channel.name
        const channelId = interaction.options.get('channel').channel.id
        
        //Controlla se il nome del canale contiene già un'emoji
        if(regexExp.test(channelName)) {
            await interaction.reply({ content: `${inlineCode('⚠️|')} <#${channelId}> ${inlineCode(`contiene già un'emoji, eliminala e riutilizza il comando`)}`, ephemeral: true })
            return
        }

        switch(subCommand) {
            case 'text':
                subCommandText(interaction)
            break
            case 'voice':
                subCommandVoice(interaction)
            break
        }
    }
}

/**
* @param {import('discord.js').Interaction} interaction 
*/
async function subCommandText(interaction) {
    const channelId = interaction.options.get('channel').channel.id
    const emoji = interaction.options.get('emoji').value

    const channel = interaction.guild.channels.cache.get(channelId)

    const newName = `${emoji}︱${channel.name}`

    await channel.edit({ name: newName })

    await interaction.reply({ content: `${inlineCode(`✅| Il nome della chat è stato modificato in`)} <#${channelId}>`, ephemeral: true })
}

/**
* @param {import('discord.js').Interaction} interaction 
*/
async function subCommandVoice(interaction) {
    const channelId = interaction.options.get('channel').channel.id
    const emoji = interaction.options.get('emoji').value

    const channel = interaction.guild.channels.cache.get(channelId)

    const newName = `[${emoji}] ${channel.name}`

    await channel.edit({ name: newName })

    await interaction.reply({ content: `${inlineCode(`✅| Il nome della chat è stato modificato in`)} <#${channelId}>`, ephemeral: true })
}