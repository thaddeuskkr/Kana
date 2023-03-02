import { Command } from '@sapphire/framework';
import { EmbedBuilder } from 'discord.js';
import ms from 'pretty-ms';

export class InfoCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'info',
            description: 'Returns information about Kana.',
            aliases: ['about']
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => 
            builder
                .setName(this.name)
                .setDescription(this.description)
                .setDMPermission(true)
        );
    }
    
    async chatInputRun(interaction) {
        const container = this.container;
        await interaction.reply({ embeds: [this.container.util.embed('loading', 'Retrieving statistics...')] });
        const owner = await this.container.client.users.fetch(this.container.config.ownerIds[0]);
        let stats = await this.container.db.get('stats');
        stats = { 
            tracksPlayed: [...stats.tracksPlayed, ...container.tracksPlayed], // List of tracks played by the bot ({ identifier, source, title, author })
            totalTracksPlayed: container.totalTracksPlayed + stats.totalTracksPlayed, // Total number of tracks played by the bot
            totalDuration: container.totalTrackDuration + stats.totalDuration, // Total duration of all tracks played by the bot (not including streams of course) in milliseconds
            totalCommandsInvoked: container.totalCommandsInvoked + stats.totalCommandsInvoked, // Total number of commands invoked by users
            totalUptime: process.uptime() + stats.totalUptime // Total uptime of the bot in seconds
        };
        const embed1 = new EmbedBuilder()
            .setTitle('About Kana')
            .setDescription(
                'Kana is a free music Discord bot with WhatsApp integrations, made using [node.js](https://nodejs.org/) and [discord.js](https://discord.js.org/), powered by [Lavalink](https://github.com/freyacodes/Lavalink) and the [Sapphire Framework](https://sapphirejs.dev). Kana aims to provide music at the highest quality possible, fully free of charge, through a simple to use interface and command list.\n' +
                `**[Invite](https://kana.tkkr.one/invite)** | **[GitHub](https://kana.tkkr.one/github)** | **[Vote](https://kana.tkkr.one/vote)** on **[top.gg](https://kana.tkkr.one/dbl)** | Currently on **v${this.container.client.version}**`
            )
            .setColor('#cba6f7')
            .addFields([
                {
                    name: 'Free:',
                    value: 'Kana is, and always will be, completely free to use. No vote-locked commands, no paywalls, and no advertisements.'
                },
                {
                    name: 'Clean:',
                    value: 'Kana has a simple and clean interface, with no clutter or really unnecessary commands or information put into embeds.'
                },
                {
                    name: 'Modern:',
                    value: 'Kana uses the latest Discord features, implementing slash commands and autocomplete (for the play command), with the latest Lavalink features too.'
                },
                {
                    name: 'Reliable:',
                    value: 'Kana has a 99.9% uptime, with no huge disruptions most of the time. The only downtime that users may face is during major feature updates.'
                },
                {
                    name: 'Open Source:',
                    value: 'Kana is open source, meaning that anyone can contribute to the project, and see how the bot works through our [GitHub](https://github.com/thaddeuskkr/Kana).'
                },
                {
                    name: 'WhatsApp:',
                    value: 'Kana has (experimental) WhatsApp integrations, meaning that most commands can be executed on WhatsApp as well as Discord with basically no latency. `/link` on Discord to get started!'
                }
            ]);
        const embed2 = new EmbedBuilder()
            .setTitle('Kana\'s Statistics')
            .setColor('#cba6f7')
            .setFooter({ text: 'Kana is made with ♡ by ' + owner.tag, iconURL: owner.displayAvatarURL({ dynamic: true, size: 4096 }) })
            .setImage('https://github.com/thaddeuskkr/Kana/blob/master/assets/kana-banner.png?raw=true')
            .addFields([
                {
                    name: 'Server count:',
                    value: String(this.container.client.guilds.cache.size),
                    inline: true
                },
                {
                    name: 'User count:',
                    value: String(this.container.client.users.cache.size),
                    inline: true
                },
                {
                    name: 'Uptime:',
                    value: ms(process.uptime() * 1000, { verbose: true }),
                    inline: true
                },
                {
                    name: 'Active players:',
                    value: String(this.container.shoukaku.getNode().stats.players),
                    inline: true
                },
                {
                    name: 'Total tracks played:',
                    value: String(stats.totalTracksPlayed),
                    inline: true
                },
                {
                    name: 'Total commands executed:',
                    value: String(stats.totalCommandsInvoked),
                    inline: true
                },
                {
                    name: 'Total play time:',
                    value: ms(stats.totalDuration, { verbose: true })
                },
                {
                    name: 'Total uptime:',
                    value: ms(stats.totalUptime * 1000, { verbose: true })
                }
            ]);
        return interaction.editReply({ embeds: [embed1, embed2] });
    }

    async whatsappRun({ msg }) {
        return msg.reply('This command is not available on WhatsApp as there is a lot of data to be presented. Please execute this command on Discord instead.');
    }
}