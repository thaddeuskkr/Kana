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

import { Precondition } from '@sapphire/framework';

export class QueuePrecondition extends Precondition {
    constructor(context, options) {
        super(context, {
            ...options,
            enabled: true,
            name: 'queue'
        });
    }
    async chatInputRun(interaction) {
        return this.checkQueue(interaction);
    }

    async contextMenuRun(interaction) {
        return this.checkQueue(interaction);
    }

    async checkQueue(interaction) {
        const dispatcher = this.container.queue.get(interaction.guildId);
        return !dispatcher.queue.length ? this.error({ message: 'There are no tracks in queue.' }) : this.ok(); 
    }
}