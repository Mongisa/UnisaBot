const { SlashCommandBuilder, EmbedBuilder, inlineCode } = require('discord.js');
const spotify = require('../../APIs/spotifyAPI.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Comandi per la musica')
        .setDMPermission(false)
        
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('▶️ Riproduce una canzone')
                .addStringOption(option =>
                    option
                        .setName('song')
                        .setDescription('La canzone da riprodurre')
                        .setAutocomplete(true)
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('⏹️ Ferma la musica')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('skip')
                .setDescription('⏭️ Salta la canzone')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('queue')
                .setDescription('ℹ️ Mostra la coda')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('pause')
                .setDescription('⏸️ Pausa la musica')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('resume')
                .setDescription('▶️ Riprende la musica')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('loop')
                .setDescription('🔁 Ripete la canzone')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('shuffle')
                .setDescription('🔀 Mescola la coda')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('🗑️ Rimuove una canzone dalla coda')
                .addIntegerOption(option =>
                    option
                        .setName('song')
                        .setDescription('La canzone da rimuovere')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('volume')
                .setDescription('🔊 Cambia il volume')
                .addIntegerOption(option =>
                    option
                        .setName('volume')
                        .setDescription('Il volume da impostare')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('seek')
                .setDescription('⏩ Salta una parte della canzone')
                .addIntegerOption(option =>
                    option
                        .setName('time')
                        .setDescription('Il tempo da saltare')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('nowplaying')
                .setDescription('🎶 Mostra la canzone in riproduzione')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('jump')
                .setDescription('⏩ Salta alla canzone')
                .addIntegerOption(option =>
                    option
                        .setName('song')
                        .setDescription('La canzone da saltare')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('clearqueue')
                .setDescription('🗑️ Cancella la coda')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('autoplay')
                .setDescription('Attiva/disattiva l\'autoplay')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('lyrics')
                .setDescription('📝 Mostra il testo della canzone')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('removealltracks')
                .setDescription('Rimuove tutte le canzoni dalla playlist')
        ),
    async execute(interaction) {
        const distube = require('../../onReadyActions/distube');

        const channel = interaction.member.voice.channel;

        if (!channel) return interaction.reply({ content: `${inlineCode("⚠️| Devi essere in un canale vocale per usare questo comando!")}`, ephemeral: true });

        const subcommand = interaction.options.getSubcommand();
        switch (subcommand) {
            case 'play':
                await play(interaction, distube);
                break;
            case 'stop':
                await stop(interaction, distube);
                break;
            case 'skip':
                await skip(interaction, distube);
                break;
            case 'queue':
                await queue(interaction, distube);
                break;
            case 'pause':
                await pause(interaction, distube);
                break;
            case 'resume':
                await resume(interaction, distube);
                break;
            case 'loop':
                await loop(interaction, distube);
                break;
            case 'shuffle':
                await shuffle(interaction, distube);
                break;
            case 'remove':
                await remove(interaction, distube);
                break;
            case 'volume':
                await volume(interaction, distube);
                break;
            case 'seek':
                await seek(interaction, distube);
                break;
            case 'nowplaying':
                await nowplaying(interaction, distube);
                break;
            case 'jump':
                await jump(interaction, distube);
                break;
            case 'clearqueue':
                await clearqueue(interaction, distube);
                break;
            case 'autoplay':
                await autoplay(interaction, distube);
                break;
            case 'lyrics':
                await lyrics(interaction, distube);
                break;
            case 'removealltracks':
                await removealltracks(interaction, distube);
                break;
        }
    },
    async autocomplete(interaction) {
        const subcommand = interaction.options.getSubcommand()
        
        if(subcommand == 'play') {
            const focusedValue = interaction.options.getFocused();

            if(focusedValue.length < 4) return

            const data = await spotify.searchTracks(focusedValue, 5)

            interaction.respond(data.map(track => ({ name: `${track.name} - 👤 ${track.artists[0].name}`, value: track.name })))
        }
    }
}

//Funzioni
/**
 * @param {import('discord.js').Interaction} interaction
 * @param {import('distube').default} distube
 */
async function play(interaction, distube) {
    const channel = interaction.member.voice.channel;

    const song = interaction.options.getString('song');

    distube.play(channel, song, { textChannel: interaction.channel, member: interaction.member, hq: true, autoplay: false, bitrate: 320000 });

    await interaction.reply('✔️')
    await interaction.deleteReply()
}

/**
 * @param {import('discord.js').Interaction} interaction
 * @param {import('distube').default} distube
 */
async function stop(interaction, distube) {

    const queue = distube.getQueue(interaction)

    if(!queue) {
        interaction.reply({ content: `${inlineCode("⚠️| Non sto riproducendo musica!")}`, ephemeral: true })
        return
    }

    distube.stop(interaction);

    await interaction.reply('✔️')
    await interaction.deleteReply()
}

/**
* @param {import('discord.js').Interaction} interaction
* @param {import('distube').default} distube
*/
async function skip(interaction, distube) {

    const queue = distube.getQueue(interaction)

    if(!queue) {
        interaction.reply({ content: `${inlineCode("⚠️| Non sto riproducendo musica!")}`, ephemeral: true })
        return
    }

    distube.skip(interaction);

    await interaction.reply({ content: `${inlineCode("✔️| Saltata la canzone!")}`, ephemeral: true })
}

/**
* @param {import('discord.js').Interaction} interaction
* @param {import('distube').default} distube
*/
async function queue(interaction, distube) {
    
    const queue = distube.getQueue(interaction)
    
    if(!queue) {
        interaction.reply({ content: `${inlineCode("⚠️| Non sto riproducendo musica!")}`, ephemeral: true })
        return
    }
    
    const queueEmbed = new EmbedBuilder()
        .setColor('#90EE90')
        .setTitle('ℹ️ Coda ℹ️')
        .setDescription(`Coda di ${queue.songs.length} canzoni`)
        .setThumbnail(queue.songs[0].thumbnail)
        .setTimestamp()
    
    queue.songs.forEach((song, index) => {
        queueEmbed.addFields({ name:`Traccia ${index + 1}`, value: `${song.name} - ${song.formattedDuration}`})
    })
    
    await interaction.reply({ embeds: [queueEmbed] })

}

/**
* @param {import('discord.js').Interaction} interaction
* @param {import('distube').default} distube
*/
async function pause(interaction, distube) {
    
    const queue = distube.getQueue(interaction)
    
    if(!queue) {
        interaction.reply({ content: `${inlineCode("⚠️| Non sto riproducendo musica!")}`, ephemeral: true })
        return
    }
    
    distube.pause(interaction);
    
    await interaction.reply({ content: `${inlineCode("✔️| Pausa!")}`, ephemeral: true })
    
}