const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Comandi per la musica')
        .setDMPermission(false)
        .addSubcommand(subcommand =>
            subcommand
                .setName('play')
                .setDescription('Riproduce una canzone')
                .addStringOption(option =>
                    option
                        .setName('song')
                        .setDescription('La canzone da riprodurre')
                        .setRequired(true)
                )
        )

        .addSubcommand(subcommand =>
            subcommand
                .setName('stop')
                .setDescription('Ferma la musica')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('skip')
                .setDescription('Salta la canzone')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('queue')
                .setDescription('Mostra la coda')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('pause')
                .setDescription('Mette in pausa la musica')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('resume')
                .setDescription('Riprende la musica')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('loop')
                .setDescription('Ripete la canzone')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('shuffle')
                .setDescription('Mischia la coda')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Rimuove una canzone dalla coda')
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
                .setDescription('Imposta il volume')
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
                .setDescription('Salta alla posizione della canzone')
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
                .setDescription('Mostra la canzone in riproduzione')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('jump')
                .setDescription('Salta alla canzone')
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
                .setDescription('Cancella la coda')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('autoplay')
                .setDescription('Attiva/disattiva l\'autoplay')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('lyrics')
                .setDescription('Mostra il testo della canzone')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('removeallfilters')
                .setDescription('Rimuove tutti i filtri')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('removeallqueue')
                .setDescription('Rimuove tutte le canzoni dalla coda')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('removealltracks')
                .setDescription('Rimuove tutte le canzoni dalla playlist')
        ),
    async execute(interaction) {
        const distube = require('../../onReadyActions/distube');
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
            case 'filter':
                await filter(interaction, distube);
                break;
            case 'filters':
                await filters(interaction, distube);
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
            case 'removefilter':
                await removefilter(interaction, distube);
                break;
            case 'lyrics':
                await lyrics(interaction, distube);
                break;
            case 'removeallfilters':
                await removeallfilters(interaction, distube);
                break;
            case 'removeallqueue':
                await removeallqueue(interaction, distube);
                break;
            case 'removealltracks':
                await removealltracks(interaction, distube);
                break;
        }
    }
}

async function play(interaction, distube) {
    const channel = interaction.member.voice.channel;

    if (!channel) return interaction.reply({ content: `${inlineCode("⚠️| Devi essere in un canale vocale per usare questo comando!")}`, ephemeral: true });

    const song = interaction.options.getString('song');

    distube.play(channel, song, { textChannel: interaction.channel, member: interaction.member, hq: true, autoplay: false, bitrate: 320000 });

    await interaction.reply('✔️')
    await interaction.deleteReply()
}

async function stop(interaction, distube) {
    const channel = interaction.member.voice.channel;

    if (!channel) return interaction.reply({ content: `${inlineCode("⚠️| Devi essere in un canale vocale per usare questo comando!")}`, ephemeral: true });

    const queue = distube.getQueue(interaction)

    if(!queue) {
        interaction.reply({ content: `${inlineCode("⚠️| Non sto riproducendo musica!")}`, ephemeral: true })
        return
    }

    distube.stop(interaction);

    await interaction.reply('✔️')
    await interaction.deleteReply()
}