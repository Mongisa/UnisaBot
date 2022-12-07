const { SlashCommandBuilder } = require('discord.js')
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

    try {

    }
    await unisaLibraryAPI.checkSpidLogin(userId, guildId)

    interaction.reply('Tutto nella norma');
}