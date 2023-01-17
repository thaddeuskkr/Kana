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

import { Listener } from '@sapphire/framework';
import { ChannelType } from 'discord.js';

export class VoiceStateUpdateListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            event: 'voiceStateUpdate'
        });
    }
    async run (o, n) {
        const dispatcher = this.container.queue.get(o.guild.id) || this.container.queue.get(n.guild.id);
        if (o.member.id !== this.container.client.user.id && n.member.id !== this.container.client.user.id) return; // Not the client
        if (!o.channelId) { // Client entered a channel
            if (n.channel.type === ChannelType.GuildStageVoice) {
                await n.setSuppressed(false);
            }
            return;
        }
        if (!n.channelId && dispatcher) return dispatcher.destroy(); // Client disconnected from the channel
        if (o.channelId !== n.channelId && o.channelId && n.channelId) { // Client moved to another channel
            if (n.channel.type === ChannelType.GuildStageVoice) {
                await n.setSuppressed(false);
            }
            return;
        }
    }
}