import { Command } from '@sapphire/framework';
// import { PaginatedMessage } from '@sapphire/discord.js-utilities';

export class LyricsCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'lyrics',
            description: 'Shows lyrics for the currently playing track or a specified one.',
            preconditions: []
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => 
            builder
                .setName(this.name)
                .setDescription(this.description)
                .setDMPermission(false)
                .addStringOption(option => 
                    option
                        .setName('query')
                        .setDescription('What track would you like to get lyrics for?')
                        .setRequired(false)
                )
        );
    }
    
    async chatInputRun(interaction) {
        return interaction.reply({ embeds: [this.container.util.embed('error', 'This command is currently disabled.')] });
        /*
        await interaction.deferReply();
        const dispatcher = this.container.queue.get(interaction.guildId);
        let query = interaction.options.getString('query');
        if (!query && !dispatcher?.current) return interaction.editReply({ embeds: [this.container.util.embed('error', 'You did not provide a query and there is nothing playing.')], ephemeral: true });
        query = query || `${dispatcher.current.info.title.replace('(Lyrics)', '')} - ${dispatcher.current.info.author.replace(' - Topic', '')}`; // most common things to replace
        const lyrics = await findLyrics.LyricsFinder(query);
        if (!lyrics || lyrics instanceof Error) {
            return interaction.editReply({ embeds: [this.container.util.embed('error', `No results for \`${query}\`.${!interaction.options.getString('query') ? ' Try searching using a query instead.' : ''}`)] });
        } else {
            const lyr = LyricsCommand.splitLyrics(lyrics);
            const pm = new PaginatedMessage();
            for (const page of lyr) {
                pm.addPageEmbed((embed) => {
                    embed
                        .setAuthor({ name: `Lyrics${!interaction.options.getString('query') ? '' : ' (Custom query)'}` })
                        .setTitle(query)
                        .setDescription(page)
                        .setFooter(this.container.config.footer)
                        .setColor('#cba6f7');
                    return embed;
                });
            }
            pm.run(interaction);
        }
        */
    }

    async whatsappRun({ msg /*, args, dispatcher */}) {
        return msg.reply('This command is currently disabled.');
        /*
        let query = args.join(' ');
        if (!query && !dispatcher?.current) return await msg.reply('You did not provide a query and there is nothing playing.');
        query = query || `${dispatcher.current.info.title.replace('(Lyrics)', '')} - ${dispatcher.current.info.author.replace(' - Topic', '')}`; // most common things to replace
        const lyrics = await findLyrics.LyricsFinder(query);
        if (!lyrics || lyrics instanceof Error) {
            return msg.reply(`No results for _${query}_.${!args.length ? ' Try searching using a query instead.' : ''}`);
        } else {
            msg.reply(`*Lyrics${!args.length ? '' : ' (Custom query)'}*\n_${lyrics}_`);
        }
        */
    }

    static splitLyrics (lyrics) {
        const maxCharsInAPage = 2000;
        const lineArray = lyrics.split('\n');
        const pages = [];
        for (let i = 0; i < lineArray.length; i++) {
            let page = '';
            while (lineArray[i].length + page.length < maxCharsInAPage) {
                page += `${lineArray[i]}\n`;
                i++;
                if (i >= lineArray.length) break;
            }
            pages.push(page);
        }
        return pages;
    }
}
