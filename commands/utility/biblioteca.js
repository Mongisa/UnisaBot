const { SlashCommandBuilder, inlineCode, EmbedBuilder, SelectMenuBuilder, SelectMenuOptionBuilder, ActionRowBuilder } = require('discord.js')
const unisaLibraryAPI = require('../../APIs/unisaLibraryAPI')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('biblioteca')
        .setDescription('Gestire prenotazioni biblioteca UNISA')
        .addSubcommand(subcommand => 
            subcommand
                .setName('loginspid')
                .setDescription('Controlla se è valido il login SPID')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('aree')
                .setDescription('Mostra le aree disponibili')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('orari')
                .setDescription('Mostra gli orari delle aree')
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
            case 'aree':
                areee(interaction)
            break
            case 'orari':
                orari(interaction)
            break
        }
    },
    /**
     * @param {import('discord.js').Interaction} interaction
     */
    async selectMenu(interaction) {
        const guildId = interaction.guildId
        const userId = interaction.user.id
        const areaId = interaction.values[0]

        interaction.deferReply()

        try {
            const dates = await unisaLibraryAPI.getAvailableDays(userId, guildId, areaId)

            const datesEmbed = new EmbedBuilder()
                .setTitle('📚 Orari disponibili 📚')
                .setDescription('Ecco gli orari disponibili per la prenotazione')
                .setColor('Aqua')
                .setTimestamp()
            
                let index = 0

                for(const date in dates) {
                const dateObj = new Date(Number(date))

                const dateString = dateObj.toLocaleTimeString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

                dates[date].forEach((time) => {
                    if(index == 25) return
                    datesEmbed.addFields({ name: dateString, value: time.time })
                    index++
                })
            }

            await interaction.editReply({ embeds: [datesEmbed], components: [] })
        } catch(e) {
            console.log(e)
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
        if(e === 'CREDENTIALS_EXPIRED') {
            await interaction.editReply({content: inlineCode('⚠️| Il tuo QR Code è scaduto! Usa nuovamente il comando per eseguire l\accesso'), epehemeral: true, files: [] })
        } else {
        await interaction.editReply({content: inlineCode('Si è verificato un errore generico!'), epehemeral: true, files: [] })
        }
    }
}

async function areee(interaction) {
    await interaction.deferReply({ ephemeral: false })

    const guildId = interaction.guildId
    const userId = interaction.user.id

    try {
        const areas = await unisaLibraryAPI.getLibraryAreas(userId, guildId)

        const areasEmbed = new EmbedBuilder()
            .setTitle('📚 Aree disponibili 📚')
            .setDescription('Ecco le aree disponibili per la prenotazione')
            .setColor('Aqua')
            .setTimestamp()
            
            areas.forEach((area,index) => {
                areasEmbed.addFields({ name: `Area ${index+1}`, value: area.testo })
            })
        await interaction.editReply({ embeds: [areasEmbed], epehemeral: false })
    } catch(e) {
        if(e === 'CREDENTIALS_EXPIRED') {
            await interaction.editReply({content: inlineCode('⚠️| Il tuo QR Code è scaduto! Usa il comando per eseguire l\accesso'), epehemeral: false })
        } else if(e === 'NO_CREDENTIALS') {
            await interaction.editReply({content: inlineCode('⚠️| Non hai ancora eseguito l\'accesso! Usa il comando per eseguire l\accesso'), epehemeral: false })
        } else {
            console.log(e)
            await interaction.editReply({content: inlineCode('Si è verificato un errore generico!'), epehemeral: false })
        }
    }
}

async function orari(interaction) {
    await interaction.deferReply({ ephemeral: true })

    const guildId = interaction.guildId
    const userId = interaction.user.id

    try {
        const areas = await unisaLibraryAPI.getLibraryAreas(userId, guildId)

        const options = []
        areas.forEach((area) => {
            options.push({label: area.testo, value: area.testo })
        })

        //Menu a tendina
        const areaMenu = new SelectMenuBuilder()
        .setCustomId('areas')
        .setPlaceholder('Seleziona un\'area')
        .addOptions(options)

        await interaction.editReply({ components: [new ActionRowBuilder().addComponents(areaMenu)] })

    } catch(e) {
        if(e == 'CREDENTIALS_EXPIRED') {
            await interaction.editReply({content: inlineCode('⚠️| Il tuo QR Code è scaduto! Usa il comando per eseguire l\accesso') })
        } else if(e == 'NO_CREDENTIALS') {
            await interaction.editReply({content: inlineCode('⚠️| Non hai ancora eseguito l\'accesso! Usa il comando per eseguire l\accesso') })
        } else {
            console.log(e)
            await interaction.editReply({content: inlineCode('Si è verificato un errore generico!') })
        }
    }
}