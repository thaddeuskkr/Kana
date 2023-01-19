/*
    Kana, a Discord bot with WhatsApp integrations and commands.
    Copyright (C) 2022 | thaddeus kuah <contact@tkkr.one>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Command } from '@sapphire/framework';
import { PaginatedMessage } from '@sapphire/discord.js-utilities';
import lyricsFinder from '@jeve/lyrics-finder';

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
        await interaction.reply({ embeds: [this.container.util.embed('loading', 'Fetching lyrics...')] });
        const dispatcher = this.container.queue.get(interaction.guildId);
        let query = interaction.options.getString('query');
        if (!query && !dispatcher?.current) return interaction.reply({ embeds: [this.container.util.embed('error', 'You did not provide a query and there is nothing playing.')] });
        if (!query) query = `${dispatcher.current.info.title.replace('(Lyrics)', '')} - ${dispatcher.current.info.author.replace(' - Topic', '')}`; // most common things to replace
        const lyrics = await lyricsFinder.LyricsFinder(query);
        if (!lyrics || lyrics instanceof Error) return interaction.editReply({ embeds: [this.container.util.embed('error', `No results for \`${query}\`.${!interaction.options.getString('query') ? ' Try searching using a query instead.' : ''}`)] });
        const lyr = LyricsCommand.splitLyrics(lyrics);
        const pm = new PaginatedMessage();
        for (const page of lyr) {
            pm.addPageEmbed((embed) => {
                embed.setAuthor({ name: `Lyrics${!interaction.options.getString('query') ? '' : ' (Custom query)'}` })
                    .setTitle(query)
                    .setDescription(page)
                    .setFooter(this.container.config.footer)
                    .setColor('#cba6f7');
                return embed;
            });
        }
        pm.run(interaction);
    }

    async whatsappRun({ msg, args, dispatcher}) {
        let query = args.join(' ');
        if (!query && !dispatcher?.current) return await msg.reply('You did not provide a query and there is nothing playing.');
        query = query || `${dispatcher.current.info.title.replace('(Lyrics)', '')} - ${dispatcher.current.info.author.replace(' - Topic', '')}`; // most common things to replace
        const lyrics = await LyricsCommand.searchLyrics(query);
        if (!lyrics || lyrics instanceof Error) return msg.reply(`No results for _${query}_.${!args.length ? ' Try searching using a query instead.' : ''}`);
        else msg.reply(`*Lyrics${!args.length ? ` (${dispatcher.current.info.title.replace('(Lyrics)', '')} - ${dispatcher.current.info.author.replace(' - Topic', '')})`: ' (Custom query)'}*\n${lyrics}`);
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

// The code below works, if you are using a network that is not detected by Cloudflare's anti-bot system.
// You will, however, need to install these packages, and it will be slower than the currently used method.
// npm i genius-discord-lyrics@https://github.com/thaddeuskkr/genius-discord-lyrics
/*
import { GeniusLyrics } from 'genius-discord-lyrics';

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
        await interaction.reply({ embeds: [this.container.util.embed('loading', 'Fetching lyrics...')] });
        const dispatcher = this.container.queue.get(interaction.guildId);
        let query = interaction.options.getString('query');
        if (!query && !dispatcher?.current) return interaction.reply({ embeds: [this.container.util.embed('error', 'You did not provide a query and there is nothing playing.')] });
        if (!query) query = `${dispatcher.current.info.title.replace('(Lyrics)', '')} - ${dispatcher.current.info.author.replace(' - Topic', '')}`; // most common things to replace
        const genius = new GeniusLyrics(this.container.config.geniusKey);
        const res = await genius.fetchLyrics(query);
        if (!res || res instanceof Error) return interaction.editReply({ embeds: [this.container.util.embed('error', `No results for \`${query}\`.${!interaction.options.getString('query') ? ' Try searching using a query instead.' : ''}`)] });
        const lyrics = res.replace(/([^\n\n])\[/g, '$1\n\n['); // Maybe format the stuff in square brackets.
        const lyr = LyricsCommand.splitLyrics(lyrics);
        const pm = new PaginatedMessage();
        for (const page of lyr) {
            pm.addPageEmbed((embed) => {
                embed.setAuthor({ name: `Lyrics${!interaction.options.getString('query') ? '' : ' (Custom query)'}` })
                    .setTitle(query)
                    .setDescription(page)
                    .setFooter(this.container.config.footer)
                    .setColor('#cba6f7');
                return embed;
            });
        }
        pm.run(interaction);
    }

    async whatsappRun({ msg, args, dispatcher}) {
        let query = args.join(' ');
        if (!query && !dispatcher?.current) return await msg.reply('You did not provide a query and there is nothing playing.');
        query = query || `${dispatcher.current.info.title.replace('(Lyrics)', '')} - ${dispatcher.current.info.author.replace(' - Topic', '')}`; // most common things to replace
        const genius = new GeniusLyrics(this.container.config.geniusKey);
        const res = await genius.fetchLyrics(query);
        if (!res || res instanceof Error) return msg.reply(`No results for _${query}_.${!args.length ? ' Try searching using a query instead.' : ''}`);
        const lyrics = res.replace(/([^\n\n])\[/g, '$1\n\n['); // Maybe format the stuff in square brackets.
        let para = lyrics.split(/\[/g);
        for (let i = 0; i < para.length; i++) {
            para[i] = para[i].trim();
        }
        const ly = para.join('\n\n[').trim();
        msg.reply(`*Lyrics${!args.length ? ` (${dispatcher.current.info.title.replace('(Lyrics)', '')} - ${dispatcher.current.info.author.replace(' - Topic', '')})`: ' (Custom query)'}*\n${ly}`);
    }

    static splitLyrics (lyrics) {
        let para = lyrics.split(/\[/g);
        for (let i = 0; i < para.length; i++) {
            para[i] = para[i].trim();
        }
        const ly = para.join('\n\n[').trim();
        const maxCharsInAPage = 2000;
        const lineArray = ly.split('\n');
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
*/