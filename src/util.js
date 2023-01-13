import { container } from '@sapphire/framework';
import { EmbedBuilder, ChannelType } from 'discord.js';
import prettyms from 'pretty-ms';

export class Util {
    static embed(type, text) {
        let color;
        let emoji = '';
        switch (type) {
        case 'success':
            color = '#a6e3a1';
            emoji = container.config.emojis.success;
            break;
        case 'error':
            color = '#f38ba8';
            emoji = container.config.emojis.error;
            break;
        case 'info':
            color = '#cba6f7';
        }
        if (text) {
            return new EmbedBuilder()
                .setDescription(emoji + ' ' + text)
                .setColor(color);
        } else {
            return new EmbedBuilder()
                .setColor(color)
                .setFooter(container.config.footer);
        }
    }
    static createProgressBar(current, end, size) {
        if (isNaN(current) || isNaN(end)) return 'Arguments current and end have to be integers.';
        const percentage = current / end;
        const progress = Math.round(size * percentage);
        const emptyProgress = size - progress;

        const progressText = '▇'.repeat(progress);
        const emptyProgressText = '—'.repeat(emptyProgress);

        return `[${progressText}${emptyProgressText}]`;
    }

    static generateCode(digits = 6) {
        let code = '';
        for (let i = 0; i < digits; i++) {
            code += Math.floor(Math.random() * 10);
        }
        return Number(code);
    }
}

export class Queue extends Map {
    constructor(client, iterable) {
        super(iterable);
        this.client = client;
        this.previous = null;
    }

    async handle(guild, member, channel, node, track, next) {
        track.info.requester = member;
        const existing = this.get(guild.id);
        if (!existing) {
            if (container.shoukaku.players.has(guild.id)) 
                return 'Busy';
            const player = await node.joinChannel({
                guildId: guild.id,
                shardId: guild.shardId,
                channelId: member.voice.channelId
            });
            container.logger.debug(`New connection @ guild "${guild.id}"`);
            const dispatcher = new Dispatcher({
                client: this.client,
                guild,
                channel,
                player,
            });
            if (next) dispatcher.queue.unshift(track);
            else dispatcher.queue.push(track);
            this.set(guild.id, dispatcher);
            container.logger.debug(`New player dispatcher @ guild "${guild.id}"`);
            return dispatcher;
        }
        if (next) existing.queue.unshift(track);
        else existing.queue.push(track);
        if (!existing.current) existing.play();
        return null;
    }
}

export class Dispatcher {
    constructor({ client, guild, channel, player }) {
        this.client = client;
        this.guild = guild;
        this.channel = channel;
        this.player = player;
        this.queue = [];
        this.repeat = 'off';
        this.current = null;
        this.stopped = false;
        let _notifiedOnce = false;
        let _errorHandler = data => {
            if ((data instanceof Error || data instanceof Object) && data.code !== 4014) container.logger.error(data);
            this.queue.length = 0;
            this.destroy();
        };

        this.player
            .on('start', async () => {
                if (this.repeat === 'one') {
                    if (_notifiedOnce) return;
                    else _notifiedOnce = true;
                } else if (this.repeat === 'all' || this.repeat === 'off') {
                    _notifiedOnce = false;
                }
                if (this.nowPlayingMessage) {
                    const msgs = await this.channel.messages.fetch({ limit: 1, force: true });
                    if (msgs.first().id === this.nowPlayingMessage.id) {
                        await this.nowPlayingMessage
                            .edit({ embeds: [ Util.embed('info', `${container.config.emojis.playing} [**${this.current.info.title}** - **${this.current.info.author}**](${this.current.info.uri}) \`${Dispatcher.humanizeTime(this.current.info.length)}\` (${this.current.info.requester.toString()})`) ] })
                            .catch(() => null);
                        return;
                    }
                }
                this.nowPlayingMessage = await this.channel
                    .send({ embeds: [ Util.embed('info', `${container.config.emojis.playing} [**${this.current.info.title}** - **${this.current.info.author}**](${this.current.info.uri}) \`${Dispatcher.humanizeTime(this.current.info.length)}\` (${this.current.info.requester.toString()})`) ] })
                    .catch(() => null);
            })
            .on('end', async () => {
                if (this.repeat === 'one') this.queue.unshift(this.current);
                if (this.repeat === 'all' && !this.current.skipped) this.queue.push(this.current);
                if (this.nowPlayingMessage && this.repeat !== 'one') {
                    const msgs = await this.channel.messages.fetch({ limit: 1, force: true });
                    if (msgs.first().id === this.nowPlayingMessage.id) return this.play();
                    else {
                        await this.nowPlayingMessage.delete().catch(() => null);
                        this.nowPlayingMessage = null;
                    }
                }
                this.play();
            })
            .on('stuck', () => {
                const stuckTrack = this.current;
                if (this.repeat === 'one') this.queue.unshift(this.current);
                if (this.repeat === 'all') this.queue.push(this.current);
                if (this.nowPlayingMessage) {
                    this.nowPlayingMessage.edit({ embeds: [Util.embed('error', `Stuck while playing track **${stuckTrack.info.title}** - **${stuckTrack.info.author}**`)] }).catch(() => null);
                    this.nowPlayingMessage = null;
                }
                this.play();
            })
            .on('error', _errorHandler);
    }

    static humanizeTime(ms) {
        return prettyms(ms, { colonNotation: true, secondsDecimalDigits: 0, millisecondsDecimalDigits: 0 });
    }

    get exists() {
        return container.queue.has(this.guild.id);
    }

    play() {
        if (this.guild.members.me?.voice?.channel?.type === ChannelType.GuildStageVoice) this.guild.members.me?.voice?.setSuppressed(false).catch(() => null);
        this.queue.previous = this.current;
        if (!this.exists || !this.queue.length) return this.destroy();
        this.current = this.queue.shift();
        this.player
            .setVolume((container.config.defaultVolume || 75) / 100)
            .playTrack({ track: this.current.track });
    }

    async destroy(reason) {
        this.queue.length = 0;
        this.player.connection.disconnect();
        if (this.nowPlayingMessage) {
            await this.nowPlayingMessage?.delete().catch(() => null);
            this.nowPlayingMessage = null;
        }
        container.queue.delete(this.guild.id);
        container.logger.debug(`Destroyed the player & connection @ guild "${this.guild.id}"\nReason: ${reason || 'No reason provided'}`);
        if (this.stopped) return;
        /*
        this.channel
            .send('No more tracks in queue.')
            .catch(() => null);
        */
    }
}