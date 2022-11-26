const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('🔗 Ping del bot'),

        /**
         * @param {import('discord.js').Interaction} interaction 
         */
        async execute(interaction) {
            interaction.reply(`Pong! \`\`${interaction.client.ws.ping} ms\`\``)
        }
}