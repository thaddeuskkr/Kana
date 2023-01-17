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

export class RemoveCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'remove',
            description: 'Removes a certain track from the queue.',
            preconditions: ['voice', 'sameVoice', 'dispatcher', 'queue']
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => 
            builder
                .setName(this.name)
                .setDescription(this.description)
                .setDMPermission(false)
                .addIntegerOption((option) =>
                    option
                        .setName('index')
                        .setDescription('Index of the track that you want to remove.')
                        .setRequired(true)
                )
        );
    }
    
    async chatInputRun(interaction) {
        const index = interaction.options.getInteger('index');
        const dispatcher = this.container.queue.get(interaction.guildId);
        if (index < 1 || index > dispatcher.queue.length) return interaction.reply({ embeds: [this.container.util.embed('error', `Invalid queue index (accepts **1** to **${dispatcher.queue.length}**).`)] });
        const track = dispatcher.queue.splice(index - 1, 1)[0];
        await interaction.reply({ embeds: [this.container.util.embed('success', `Removed **${track.info.title}** - **${track.info.author}** from the queue.`)] });
    }

    async whatsappRun({ msg, args, dispatcher, sameVoice, voice, discordUser }) {
        if (!discordUser) return await msg.reply('You are not linked to a Discord account. Use ```/link``` to link your WhatsApp account to your Discord account.');
        if (voice === false) return await msg.reply('You are not in a voice channel.');
        if (sameVoice === false) return await msg.reply('You are not in the same voice channel as the bot.');
        if (!dispatcher) return await msg.reply('There is nothing playing.');
        if (!dispatcher.queue.length) return await msg.reply('There are no tracks in the queue.');
        if (isNaN(Number(args[0]))) return await msg.reply('Invalid queue index.');
        const index = parseInt(args[0]);
        if (index < 1 || index > dispatcher.queue.length) return msg.reply(`Invalid queue index (accepts *1* to *${dispatcher.queue.length}*).`);
        const track = dispatcher.queue.splice(index - 1, 1)[0];
        await msg.reply(`Removed *${track.info.title}* - *${track.info.author}* from the queue.`);
    }
}
