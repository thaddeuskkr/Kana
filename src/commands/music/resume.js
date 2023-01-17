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

export class ResumeCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'resume',
            description: 'Resumes the currently paused track, if any.',
            preconditions: ['voice', 'sameVoice', 'dispatcher']
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
        if (!dispatcher.player.paused) return interaction.reply({ embeds: [this.container.util.embed('error', `**${dispatcher.current.info.title}** - **${dispatcher.current.info.author}** is not paused.`)] });
        await dispatcher.player.setPaused(false);
        await interaction.reply({ embeds: [this.container.util.embed('success', `Resumed **${dispatcher.current.info.title}** - **${dispatcher.current.info.author}**.`)] });
    }

    async whatsappRun({ msg, dispatcher, sameVoice, voice, discordUser }) {
        if (!discordUser) return await msg.reply('You are not linked to a Discord account. Use ```/link``` to link your WhatsApp account to your Discord account.');
        if (voice === false) return await msg.reply('You are not in a voice channel.');
        if (sameVoice === false) return await msg.reply('You are not in the same voice channel as the bot.');
        if (!dispatcher) return await msg.reply('There is nothing playing.');
        if (!dispatcher.player.paused) return msg.reply(`*${dispatcher.current.info.title}* - *${dispatcher.current.info.author}* is not paused.`);
        await dispatcher.player.setPaused(false);
        await msg.reply(`Resumed *${dispatcher.current.info.title}* - *${dispatcher.current.info.author}*.`);
    }
}
