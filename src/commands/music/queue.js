import { Command } from '@sapphire/framework';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import prettyms from 'pretty-ms';
import _ from 'lodash';

export class QueueCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'queue',
            description: 'Shows you the current queue for the server.',
            aliases: ['q'],
            preconditions: ['dispatcher']
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => 
            builder
                .setName(this.name)
                .setDescription(this.description)
                .setDMPermission(false)
        );
    }
    
    async chatInputRun(interaction) {
        const dispatcher = this.container.queue.get(interaction.guildId);
        const queue = dispatcher.queue;
        const current = dispatcher.current;
        const chunked = _.chunk(queue, this.container.config.tracksPerPage || 15);
        const pm = new PaginatedMessage();
        let motd = { enabled: false };
        if (Object(this.container.motd) && this.container.motd.enabled && this.container.motd?.text?.length > 0) motd = this.container.motd;
        let looptxt = '';
        if (dispatcher.repeat === 'all') looptxt = ' • Looping the queue';
        else if (dispatcher.repeat === 'one') looptxt = ' • Looping the current track';
        if (!queue.length) {
            pm.addPageEmbed((embed) => {
                embed
                    .setAuthor({ name: `${interaction.guild.name} - Queue`, iconURL: interaction.guild.iconURL({ size: 4096 }) })
                    .setDescription(`**Now playing:**\n[${current.info.title} - ${current.info.author}](${current.info.uri}) (${current.info.requester.toString()})${current.info.isStream ? ' `LIVE`' : `\n\`${this.humanizeTime(dispatcher.player.position)} ${this.container.util.createProgressBar(dispatcher.player.position, current.info.length, 20)} ${this.humanizeTime(current.info.length)}\``}\n\n***No tracks in queue.***`)
                    .setColor('#cba6f7')
                    .setFooter({ text: `${this.container.config.footer.text}${looptxt}${motd.enabled ? ' • ' + motd.text : ''}`, iconURL: motd.enabled ? motd.icon || this.container.config.footer.iconURL : this.container.config.footer.iconURL });
                if (motd.enabled && motd.image) embed.setImage(motd.image);
                return embed;
            });
        }
        let queueDuration = 0;
        for (const track of queue) {
            queueDuration += track.info.length;
        }
        if (queue.find((track) => track.info.isStream)) queueDuration = '∞';
        for (let x = 0; x < chunked.length; x++) {
            let descriptionLines = [];
            for (let i = 0; i < chunked[x].length; i++) {
                const track = chunked[x][i];
                descriptionLines.push(`**${(i + 1) + (x * (this.container.config.tracksPerPage || 15))}:** [${track.info.title} - ${track.info.author}](${track.info.uri}) \`${track.info.isStream ? '∞' : this.humanizeTime(track.info.length)}\` (${track.info.requester.toString()})`);
            }
            pm.addPageEmbed((embed) => {
                embed
                    .setAuthor({ name: `${interaction.guild.name} - Queue`, iconURL: interaction.guild.iconURL({ size: 4096 }) })
                    .setDescription(`[${current.info.title} - ${current.info.author}](${current.info.uri}) (${current.info.requester.toString()})${current.info.isStream ? ' `LIVE`' : `\n\`${this.humanizeTime(dispatcher.player.position)} ${this.container.util.createProgressBar(dispatcher.player.position, current.info.length, 20)} ${this.humanizeTime(current.info.length)}\``}\n\n` + descriptionLines.join('\n'))
                    .setColor('#cba6f7')
                    .setFooter({ text: queue.length > 500 ? `Showing up to 500 of ${queue.length} total tracks in queue (Total duration: ${this.humanizeTime(queueDuration)})${looptxt}${motd.enabled ? ' • ' + motd.text : ''}` : `${queue.length} tracks in queue (Total duration: ${this.humanizeTime(queueDuration)})${looptxt}${motd.enabled ? ' • ' + motd.text : ''}`, iconURL: motd.enabled ? motd.icon || this.container.config.footer.iconURL : this.container.config.footer.iconURL });
                if (motd.enabled && motd.image) embed.setImage(motd.image);
                return embed;
            });
        }
        pm.run(interaction);
    }

    async whatsappRun({ msg, dispatcher, discordUser, voice, sameVoice }) {
        if (!discordUser) return await msg.reply('You are not linked to a Discord account. Use ```/link``` to link your WhatsApp account to your Discord account.');
        if (voice === false) return await msg.reply('You are not in a voice channel.');
        if (sameVoice === false) return await msg.reply('You are not in the same voice channel as the bot.');
        if (!dispatcher) return await msg.reply('There is nothing playing.');
        const queue = dispatcher.queue;
        const current = dispatcher.current;
        let looptxt = '';
        if (dispatcher.repeat === 'all') looptxt = '_(Looping the queue)_';
        else if (dispatcher.repeat === 'one') looptxt = '_(Looping the current track)_';
        if (!queue.length) {
            await msg.reply(`*${dispatcher.guild.name} - Queue* ${looptxt}\n\n*Now playing:*\n${current.info.title} - ${current.info.author} (${current.info.requester.user.tag})\n\`\`\`${this.humanizeTime(dispatcher.player.position)} ${this.container.util.createProgressBar(dispatcher.player.position, current.info.length, 20)} ${this.humanizeTime(current.info.length)}\`\`\`\n\n*No tracks in queue.*`);
            return;
        }
        let queueDuration = 0;
        for (const track of queue) {
            queueDuration += track.info.length;
        }
        let descriptionLines = [];
        for (let i = 0; i < queue.length; i++) {
            const track = queue[i];
            descriptionLines.push(`*${(i + 1)}:* ${track.info.title} - ${track.info.author} [\`\`\`${this.humanizeTime(track.info.length)}\`\`\`] (${track.info.requester.user.tag})`);
        }
        descriptionLines.push(`\n*${queue.length} tracks in queue (Total duration: ${this.humanizeTime(queueDuration)})*`);
        await msg.reply(`*${dispatcher.guild.name} - Queue* ${looptxt}\n\n*Now playing:*\n${current.info.title} - ${current.info.author} (${current.info.requester.user.tag})\n\`\`\`${this.humanizeTime(dispatcher.player.position)} ${this.container.util.createProgressBar(dispatcher.player.position, current.info.length, 20)} ${this.humanizeTime(current.info.length)}\`\`\`\n\n` + descriptionLines.join('\n'));
    }

    humanizeTime(ms) {
        return prettyms(ms, { colonNotation: true, secondsDecimalDigits: 0, millisecondsDecimalDigits: 0 });
    }
}
