const { SlashCommandBuilder, inlineCode } = require('discord.js')

const risposte = ['Per quanto posso vedere, sì','È certo','È decisamente così','Molto probabilmente','Le prospettive sono buone','I segni indicano di sì','Senza alcun dubbio','Sì','Sì, senza dubbio','Ci puoi contare','È difficile rispondere, prova di nuovo','Rifai la domanda più tardi','Meglio non risponderti adesso','Non posso predirlo ora','Concentrati e rifai la domanda','Non ci contare','La mia risposta è no','Le mie fonti dicono di no','Le prospettive non sono buone','Molto incerto']

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('🙋 Fai una domanda al bot')
        .addStringOption((option => option.setName('domanda').setDescription('La domanda da fare al bot').setRequired(true))),

        /**
        * @param {import('discord.js').Interaction} interaction 
        */
        async execute(interaction) {
            const domanda = interaction.options.data[0].value

            if(!domanda.endsWith('?')) {
                interaction.reply({ content: inlineCode('⚠️| Devi farmi una domanda, non sparare cose a caso'), ephemeral: true })
                return
            }

            const number = await getRandomArbitrary(0,risposte.length)

            interaction.reply({ content: `\`\`Domanda: ${domanda}\`\`\n${risposte[number]}`, ephemeral: false })
        }
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 * @param {Number} min Numero minimo
 * @param {Number} max Numero Massimo
 */
 function getRandomArbitrary(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}