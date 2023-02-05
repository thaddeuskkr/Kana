import { Command } from '@sapphire/framework';
import { ApplicationCommandType } from 'discord-api-types/v10';

export class PlayCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'play',
            description: 'Plays music from one of multiple supported sources.',
            aliases: ['p', 'pl'],
            preconditions: ['voice', 'sameVoice']
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => 
            builder
                .setName(this.name)
                .setDescription(this.description)
                .setDMPermission(false)
                .addStringOption((option) => 
                    option
                        .setName('query').setDescription('What would you like to search? Supports URLs from many sources and search queries from 3 sources.')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
                .addStringOption((option) =>
                    option
                        .setName('source')
                        .setDescription('Where would you like to search for music from? (Defaults to YouTube Music)')
                        .setRequired(false)
                        .addChoices(
                            { name: 'YouTube Music / ytm', value: 'ytmsearch' },
                            { name: 'YouTube / yt', value: 'ytsearch' },
                            { name: 'SoundCloud / sc', value: 'scsearch' }
                        )
                )
                .addBooleanOption((option) => 
                    option
                        .setName('next')
                        .setDescription('Whether to add the track to the top of the queue. If not specified or false, adds to the end.')
                        .setRequired(false)
                )
        );
        registry.registerContextMenuCommand((builder) => 
            builder
                .setName(this.name)
                .setType(ApplicationCommandType.Message)
                .setDMPermission(false)
        );
    }

    async chatInputRun(interaction) {
        const query = interaction.options.getString('query');
        const source = interaction.options.getString('source') || 'ytmsearch';
        const next = interaction.options.getBoolean('next') || false;
        const node = this.container.shoukaku.getNode();
        if (PlayCommand.checkURL(query)) {
            let result = await node.rest.resolve(query); 
            if (!result?.tracks.length) result = await node.rest.resolve(query); // Retry
            if (!result?.tracks.length) return interaction.reply({ embeds: [this.container.util.embed('error', `No results for \`${query}\`.`)], ephemeral: true });
            const track = result.tracks.shift();
            const playlist = result.loadType === 'PLAYLIST_LOADED';
            const dispatcher = await this.container.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track, playlist ? false : next);
            if (dispatcher === 'Busy') return interaction.reply({ embeds: [this.container.util.embed('error', 'The dispatcher is currently busy, please try again later.')], ephemeral: true });
            if (playlist) {
                for (const track of result.tracks) await this.container.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track);
            }
            await interaction.reply({ embeds: [this.container.util.embed('success', playlist ? `Queued **${result.tracks.length + 1} tracks** from **${result.playlistInfo.name}**.` : `Queued [**${track.info.title}** - **${track.info.author}**](${track.info.uri}).`)] }).catch(() => null);
            if (!dispatcher?.current) dispatcher?.play();
            return;
        }
        let search = await node.rest.resolve(`${source}:${query}`);
        if (!search?.tracks.length) search = await node.rest.resolve(`${source}:${query}`);
        if (!search?.tracks.length) return interaction.reply({ embeds: [this.container.util.embed('error', `No results for \`${query}\`.`)], ephemeral: true });
        const track = search.tracks.shift();
        const dispatcher = await this.container.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track, next);
        if (dispatcher === 'Busy') return interaction.reply({ embeds: [this.container.util.embed('error', 'The dispatcher is currently busy, please try again later.')], ephemeral: true });
        await interaction.reply({ embeds: [this.container.util.embed('success', `Queued [**${track.info.title}** - **${track.info.author}**](${track.info.uri}).`)] }).catch(() => null);
        if (!dispatcher?.current) dispatcher?.play();
    }
    
    async contextMenuRun(interaction) {
        const node = this.container.shoukaku.getNode();
        let query = interaction.targetMessage.content;
        if (!query) return interaction.reply({ embeds: [this.container.util.embed('error', 'The message you selected has no content.')], ephemeral: true });
        if (PlayCommand.extractURL(query)) {
            let result = await node.rest.resolve(PlayCommand.extractURL(query)[0]);
            if (!result?.tracks.length) result = await node.rest.resolve(PlayCommand.extractURL(query)[0]);
            if (!result?.tracks.length) return interaction.reply({ embeds: [this.container.util.embed('error', `No results for \`${query}\`.`)], ephemeral: true });
            const track = result.tracks.shift();
            const playlist = result.loadType === 'PLAYLIST_LOADED';
            const dispatcher = await this.container.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track, playlist ? false : (query.includes('--playnext') || query.includes('-pn')));
            if (dispatcher === 'Busy') return interaction.reply({ embeds: [this.container.util.embed('error', 'The dispatcher is currently busy, please try again later.')], ephemeral: true });
            if (playlist) {
                for (const track of result.tracks) await this.container.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track);
            }
            await interaction.reply({ embeds: [this.container.util.embed('success', playlist ? `Queued **${result.tracks.length + 1} tracks** from **${result.playlistInfo.name}**.` : `Queued [**${track.info.title}** - **${track.info.author}**](${track.info.uri}).`)] }).catch(() => null);
            if (!dispatcher?.current) dispatcher?.play();
            return;
        }
        let qSource;
        if (query.includes('yt:')) {
            query = query.replace('yt:', '');
            qSource = 'ytsearch';
        } else if (query.includes('ytm:')) {
            query = query.replace('ytm:', '');
            qSource = 'ytmsearch';
        } else if (query.includes('sc:')) {
            query = query.replace('sc:', '');
            qSource = 'scsearch';
        } else qSource = undefined;
        let search = await node.rest.resolve(`${qSource || 'ytmsearch'}:${query}`);
        if (!search?.tracks.length) search = await node.rest.resolve(`${qSource || 'ytmsearch'}:${query}`);
        if (!search?.tracks.length) return interaction.reply({ embeds: [this.container.util.embed('error', `No results for \`${query}\`.`)], ephemeral: true });
        const track = search.tracks.shift();
        console.log(interaction);
        const dispatcher = await this.container.queue.handle(interaction.guild, interaction.member, interaction.channel, node, track, false);
        if (dispatcher === 'Busy') return interaction.reply({ embeds: [this.container.util.embed('error', 'The dispatcher is currently busy, please try again later.')], ephemeral: true });
        await interaction.reply({ embeds: [this.container.util.embed('success', `Queued [**${track.info.title}** - **${track.info.author}**](${track.info.uri}).`)] }).catch(() => null);
        if (!dispatcher?.current) dispatcher?.play();
    }

    async autocompleteRun(interaction) {
        let node = this.node;
        if (!node) {
            node = await this.container.shoukaku.getNode();
            this.node = node;
        }
        let query = interaction.options.getString('query');
        let qSource;
        if (query.includes('yt:')) {
            query = query.replace('yt:', '');
            qSource = 'ytsearch';
        } else if (query.includes('ytm:')) {
            query = query.replace('ytm:', '');
            qSource = 'ytmsearch';
        } else if (query.includes('sc:')) {
            query = query.replace('sc:', '');
            qSource = 'scsearch';
        } else qSource = undefined;
        if (!query) return;
        const source = qSource || interaction.options.getString('source') || 'ytmsearch';
        const search = await node.rest.resolve(`${source}:${query}`);
        if (search.loadType !== 'SEARCH_RESULT') return interaction.respond([{ name: PlayCommand.truncate(query, 97), value: query }]);
        return interaction.respond(search.tracks.map((track) => ({ name: PlayCommand.truncate(`${track.info.title} - ${track.info.author}`, 97), value: track.info.uri })));
    }

    async whatsappRun({ args, msg, discordUser, voiceChannels, voice, sameVoice }) {
        if (!discordUser) return await msg.reply('You are not linked to a Discord account. Use ```/link``` to link your WhatsApp account to your Discord account.');
        if (voice === false) return await msg.reply('You are not in a voice channel.');
        if (sameVoice === false) return await msg.reply('You are not in the same voice channel as the bot.');
        let query = args.join(' ');
        const next = (query.includes('--playnext') || args.includes('-next')) || false;
        if (next === true) query.replace('--playnext', '').replace('-next', '');
        let qSource;
        if (query.includes('yt:') || query.includes('--youtube') || query.includes('-yt')) {
            query = query.replace('yt:', '').replace('--youtube', '').replace('-yt', '');
            qSource = 'ytsearch';
        } else if (query.includes('ytm:') || query.includes('--youtubemusic') || query.includes('-ytm')) {
            query = query.replace('ytm:', '').replace('--youtubemusic', '').replace('-ytm', '');
            qSource = 'ytmsearch';
        } else if (query.includes('sc:') || query.includes('--soundcloud') || query.includes('-sc')) {
            query = query.replace('sc:', '').replace('--soundcloud', '').replace('-sc', '');
            qSource = 'scsearch';
        } else qSource = 'ytmsearch';
        if (!query) return msg.reply('Please provide a query.');
        const node = this.container.shoukaku.getNode();
        if (!voiceChannels.length) return msg.reply('You are not in a voice channel.');
        if (voiceChannels.length > 1) return msg.reply(`You are in multiple voice channels. Using ${voiceChannels[0].name}.`);
        const voiceChannel = voiceChannels[0];
        const member = voiceChannel.members.find((member) => member.id === discordUser.id);
        if (PlayCommand.checkURL(query)) {
            let result = await node.rest.resolve(query); 
            if (!result?.tracks.length) result = await node.rest.resolve(query); // Retry
            if (!result?.tracks.length) return msg.reply(`No results for _${query}_.`);
            const track = result.tracks.shift();
            const playlist = result.loadType === 'PLAYLIST_LOADED';
            const dispatcher = await this.container.queue.handle(voiceChannel.guild, member, voiceChannel, node, track, playlist ? false : next);
            if (dispatcher === 'Busy') return msg.reply('The dispatcher is busy, please try again later.');
            if (playlist) {
                for (const track of result.tracks) await this.container.queue.handle(voiceChannel.guild, member, voiceChannel, node, track);
            }
            await msg.reply(playlist ? `Queued *${result.tracks.length + 1} tracks* from *${result.playlistInfo.name}*.` : `Queued *${track.info.title}* - *${track.info.author}*.`).catch(() => null);
            if (!dispatcher?.current) dispatcher?.play();
            return;
        }
        let search = await node.rest.resolve(`${qSource}:${query}`);
        if (!search?.tracks.length) search = await node.rest.resolve(`${qSource}:${query}`);
        if (!search?.tracks.length) return msg.reply(`No results for _${query}_.`);
        const track = search.tracks.shift();
        const dispatcher = await this.container.queue.handle(voiceChannel.guild, member, voiceChannel, node, track, next);
        if (dispatcher === 'Busy') return msg.reply('The dispatcher is busy, please try again later.');
        await msg.reply(`Queued *${track.info.title}* - *${track.info.author}*.`).catch(() => null);
        if (!dispatcher?.current) dispatcher?.play();
    }

    static checkURL(string) {
        try {
            new URL(string);
            return true;
        } catch (error) {
            return false;
        }
    }

    static extractURL(str, lower = false) {
        const regexp = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\\+.~#?!&//=]*)/gi;
        if (str) {
            let urls = str.match(regexp);
            if (urls) {
                return lower ? urls.map((item) => item.toLowerCase()) : urls;
            } else {
                return undefined;
            }
        } else {
            return undefined;
        }
    }

    static truncate(str, n){
        return (str.length > n) ? str.slice(0, n-1) + '...' : str;
    }
}