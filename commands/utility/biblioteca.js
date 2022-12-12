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
                aree(interaction)
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
        const menuArray = interaction.customId.split('%')
        const menuId = menuArray[1]
        
        switch(menuId) {
            case 'areas':
                selectMenuAree(interaction)
            break
            case 'days':
                selectMenuGiorni(interaction)
            break
        }
    }
}

//Funzioni sottocomandi
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

async function aree(interaction) {
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
        .setCustomId('biblioteca%areas')
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

//Funzioni menù selezione
/**
 * @param {import('discord.js').Interaction} interaction
 */
async function selectMenuAree(interaction) {
    //Questa funzione viene eseguita nel momento in cui viene seleionata un'area dal menù a tendina con id 'areas'

    interaction.deferReply({ ephemeral: true })

    const guildId = interaction.guildId
    const userId = interaction.user.id
    const areaId = interaction.values[0]

    try {
        const dates = await unisaLibraryAPI.getAvailableDays(userId, guildId, areaId)

        const options = []
        dates.forEach((date) => {
            const dateObj = new Date(Number(date.date))

            const dateString = dateObj.toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

            options.push({label: dateString, value: `${date.date}%${areaId}` })
        })

        //Menu a tendina
        const daysMenu = new SelectMenuBuilder()
        .setCustomId('biblioteca%days')
        .setPlaceholder('Seleziona un giorno')
        .addOptions(options)

        await interaction.editReply({ components: [new ActionRowBuilder().addComponents(daysMenu)] })
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

async function selectMenuGiorni(interaction) {
    //Questa funzione viene eseguita nel momento in cui viene selezionato un giorno dal menù a tendina con id 'days'
    await interaction.deferReply()

    const menuValue = interaction.values[0].split('%')
    const userId = interaction.user.id
    const guildId = interaction.guildId
    const date = menuValue[0]
    const areaId = menuValue[1]
    
    try {
        const hours = await unisaLibraryAPI.getAvailableHours(userId, guildId, areaId, date)

        const dateObj = new Date(Number(hours[0].date))
        const dateString = dateObj.toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

        const hoursEmbed = new EmbedBuilder()
            .setTitle('🕒 Orari disponibili 🕒')
            .setColor('Aqua')
            .setDescription(`Orari disponibili per ${dateString}`)
            .addFields({name: 'Area', value: areaId })
            hours.forEach((hour) => {
                

                hoursEmbed.addFields({name: hour.time, value: hour.avaible ? '🟢 Disponibile' : '🔴 Non disponibile' })
            })

        await interaction.editReply({ embeds: [hoursEmbed] })
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