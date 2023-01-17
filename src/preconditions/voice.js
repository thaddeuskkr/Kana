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

export class VoicePrecondition extends Precondition {
    constructor(context, options) {
        super(context, {
            ...options,
            enabled: true,
            name: 'voice'
        });
    }
    async chatInputRun(interaction) {
        return this.checkInVc(interaction.member);
    }

    async contextMenuRun(interaction) {
        return this.checkInVc(interaction.member);
    }

    async checkInVc(member) {
        return member.voice?.channel?.id ? this.ok() : this.error({ message: 'You are not in a voice channel.' });
    }
}