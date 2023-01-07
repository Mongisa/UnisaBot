const { SlashCommandBuilder, inlineCode, EmbedBuilder } = require('discord.js')
const googleAPI = require('../../APIs/googleAPI')

module.exports = {
    ignored: true,
    data: new SlashCommandBuilder()
        .setName('esame')
        .setDescription('📝 Mostra le date degli esami')
        .addStringOption(option =>
            option
                .setName('materia')
                .setDescription('Materia da cercare')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option
                .setName('periodo')
                .setDescription('Periodo da cercare')
                .setRequired(true)
                .setAutocomplete(true)
        )
        .addStringOption(option =>
            option
                .setName('nome_esame')
                .setDescription('Nome esame da cercare')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    /**
     * @param {import('discord.js').Interaction} interaction
     */
    async autocomplete(interaction) {
        const focusedValueName = interaction.options.getFocused(true).name
        
        switch(focusedValueName) {
            case 'materia':
                materiaAutocomplete(interaction)
            break
            case 'periodo':
                periodoAutocomplete(interaction)
            break
            case 'nome_esame':
                examNameAutocomplete(interaction)
            break
        }
    },
    async execute(interaction) {
        const materia = interaction.options.getString('materia')
        const periodo = interaction.options.getString('periodo')
        const nomeEsame = interaction.options.getString('nome_esame')

        try {
            const result = await googleAPI.getDiemDates()

            if(!result[materia] || !result[materia][periodo] || !result[materia][periodo][nomeEsame]) throw new Error('Materia, periodo o esame non trovato (usa i suggerimenti per cercare)')

            const dates = result[materia][periodo][nomeEsame].dates
            
            const examEmbed = new EmbedBuilder()
                .setTitle(`📝 ${nomeEsame.toUpperCase()}`)
                .setDescription(`**Materia**: ${materia}\n**Periodo**: ${periodo}`)
                .setFooter({ text: `Powered by Google Sheets API`, iconURL: 'https://developers.google.com/drive/images/drive_icon.png' })
                .setColor('Yellow')
                .setTimestamp()

            dates.forEach((date,index) => {
                if(date == '') return
                examEmbed.addFields({ name: [index + 1].toString() + ' Appello', value: date })
            })

            await interaction.reply({ embeds: [examEmbed] })
            
        } catch(err) {
            console.log(err)
            await interaction.reply({ content: inlineCode(`⚠️| ${err}`), ephemeral: true })
        }
    }
}

//Funzioni
/**
 * @param {import('discord.js').Interaction} interaction 
 */
async function materiaAutocomplete(interaction) {
    try {
        const diemDates = await googleAPI.getDiemDates()
        const diemSubjects = Object.keys(diemDates)

        const focusedValue = interaction.options.getFocused()
        
        const filtered = diemSubjects.filter(subject => subject.toLowerCase().includes(focusedValue.toLowerCase()))

        await interaction.respond(filtered.map(choice => ({name: choice, value: choice })))
    } catch(err) {
        console.log(err)
    }
}

/**
 * @param {import('discord.js').Interaction} interaction 
 */
async function periodoAutocomplete(interaction) {
    
    const materia = interaction.options.getString('materia')

    if(!materia) {
        await interaction.respond([{ name: '⚠️ Inserisci prima una materia ⚠️', value: 'Inserisci prima una materia'}])
        return
    }
    
    try {
        const diemDates = await googleAPI.getDiemDates()

        if(!diemDates[materia]) {
            await interaction.respond([{ name: '⚠️ Materia non trovata ⚠️', value: 'Materia non trovata'}])
            return
        }

        const diemPeriods = Object.keys(diemDates[materia])

        if(!diemPeriods) {
            await interaction.respond([{ name: '⚠️ Nessun periodo trovato ⚠️', value: 'Nessun periodo trovato'}])
            return
        }

        const focusedValue = interaction.options.getFocused()
        
        const filtered = diemPeriods.filter(period => period.toLowerCase().includes(focusedValue.toLowerCase()))

        await interaction.respond(filtered.map(choice => ({name: choice, value: choice })))
    } catch(err) {
        console.log(err)
    }
}

/**
 * @param {import('discord.js').Interaction} interaction 
 */
async function examNameAutocomplete(interaction) {
    const materia = interaction.options.getString('materia')
    const periodo = interaction.options.getString('periodo')

    if(!materia || !periodo) {
        await interaction.respond([{ name: '⚠️ Inserisci prima una materia e un periodo ⚠️', value: 'Inserisci prima una materia e un periodo'}])
        return
    }

    try {

        const diemDates = await googleAPI.getDiemDates()
        
        if(!diemDates[materia] || !diemDates[materia][periodo]) {
            await interaction.respond([{ name: '⚠️ No Data ⚠️', value: 'No Data'}])
            return
        }

        const diemExams = Object.keys(diemDates[materia][periodo])

        const focusedValue = interaction.options.getFocused()
        
        const filtered = diemExams.filter(exam => exam.toLowerCase().includes(focusedValue.toLowerCase()))

        await interaction.respond(filtered.map(choice => ({name: choice, value: choice })))

    } catch(err) {
        console.log(err)
    }
}