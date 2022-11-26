const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const nasaAPI = require('../../APIs/nasaAPI');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nasa')
        .setDescription('🌠 Interfacciati con l\'API della NASA')

        //Foto del giorno
        .addSubcommand(subcommand =>
            subcommand
                .setName('pod')
                .setDescription('📸 Foto del giorno')
            ),
    /**
     * @param {import('discord.js').Interaction} interaction  
     */
    async execute(interaction) {
        await interaction.deferReply()
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'pod') {
            const pod = await nasaAPI.pictureOfTheDay();

            if(pod.media_type === 'video') {
                await interaction.editReply({ content: 'Non posso inviare video, ma puoi vederlo qui: ' + pod.url });ù
                return
            }

            const attachment = new AttachmentBuilder()
                .setFile(pod.url)
                .setName('pod.jpg')
            
            const podEmbed = new EmbedBuilder()
                .setTitle(pod.title)
                .setURL(pod.url)
                .setColor('#120a8f')
                .setDescription(pod.explanation)
                .setTimestamp()
                .setFooter({ text: 'Powered by NASA', iconURL: 'https://www.pngkey.com/png/full/481-4819402_nasa-logo-png-transparent-logo-nasa-hd-png.png' });
            
            await interaction.editReply({ embeds: [podEmbed], files: [attachment] });
        }
    }
}