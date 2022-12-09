const { SlashCommandBuilder, inlineCode } = require('discord.js')
const unisaLibraryAPI = require('../../APIs/unisaLibraryAPI')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('biblioteca')
        .setDescription('Gestire prenotazioni biblioteca UNISA')
        .addSubcommand(subcommand => 
            subcommand
                .setName('loginspid')
                .setDescription('Controlla se è valido il login SPID')
        ),
    /**
     * @param {import('discord.js').interaction} interaction 
     */
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand()

        switch(subcommand) {
            case 'loginspid':
                loginSpid(interaction)
            break
        }
    }
}

/**
 * @param {import('discord.js').Interaction} interaction 
 */
async function loginSpid(interaction) {
    const guildId = interaction.guildId
    const userId = interaction.user.id

    await interaction.deferReply({ ephemeral: true })

    try {
        await unisaLibraryAPI.checkSpidLogin(userId, guildId, interaction)
        await interaction.editReply({content: inlineCode("✔️| Accesso SPID eseguito con successo!"), epehemeral: true, files: [] })
    } catch(e) {
        if(e.message === 'EXPIRED') {
            await interaction.editReply({content: inlineCode('⚠️| Il tuo QR Code è scaduto! Usa nuovamente il comando per eseguire l\accesso'), epehemeral: true, files: [] })
        } else {
        await interaction.editReply({content: inlineCode('Si è verificato un errore generico!'), epehemeral: true, files: [] })
        }
    }
}