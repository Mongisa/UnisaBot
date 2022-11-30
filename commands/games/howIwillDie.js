const { SlashCommandBuilder, EmbedBuilder, inlineCode } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('morte')
        .setDescription('🪦 Come e quando morirai')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Utente')
            ),
    /**
     * @param {import('discord.js').Interaction} interaction
    */
    async execute(interaction) {

        const user = interaction.options.getUser('user') || interaction.user;

        if(user.bot) return interaction.reply({ content: inlineCode('⚠️| Non puoi usare questo comando su un bot!'), ephemeral: true });

        const morti = ["Affogato nella pasta all'arrabbiata",
            "Inseguito da MASSIMO BOSSETTI",
            "Annegato nel mare di stronzate che dice Michele",
            "Ucciso in una Pentakill da parte di Kokashin", 
            "Trucidato da Pippu u 'cannistru",
            "Schiacciato dal piedone di Chiara Ferragni",
            "Mangiato da Shrek",
            "Ucciso da un'onda di gente che dice 'ciao'",
            "Investito dalla macchina di Pitone",
            "Morto in un incidente navale",
            "Morto nella strage del Titanic",
            "Morto di cacca addosso"
        ]

        const number = randomNumber(0, morti.length);

        const start = new Date(Date.now())
        const end = new Date(start.getFullYear() + 80,0,0,0,0,0,0)

        const deathDate = randomDate(start, end).toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        })

        const deathEmbed = new EmbedBuilder()
            .setTitle('🪦 Come e quando morirà ' + user.username + ' 🪦')
            .setDescription(`Morirà ${inlineCode(morti[number])} il ${inlineCode(deathDate)}`)
            .setThumbnail('https://images.vexels.com/media/users/3/202721/isolated/preview/a1213f8761f0fa006e6a80d484bace90-rip-gravestone-icon-black.png')
            .setColor('#ff0000')
            .setTimestamp()
            .setFooter({ text: 'Powered by Discord.js', iconURL: 'https://www.clipartmax.com/png/middle/89-894960_js-discord-bot-logo-node-js-and-react-js.png' })

        await interaction.reply({ embeds: [deathEmbed] });
    }
}

//Funzioni

function randomNumber(min, max) { 
    return Math.round(Math.random() * (max - min) + min);
} 

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}