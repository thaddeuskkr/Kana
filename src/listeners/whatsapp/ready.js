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

import { Listener, container } from '@sapphire/framework';

export class WhatsappReadyListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            emitter: container.whatsapp,
            event: 'ready',
            name: 'whatsappReady'
        });
    }
    run() {
        this.container.logger.info(`WhatsApp connected! | ${container.whatsapp.info.pushname} (${container.whatsapp.info.wid.user})`);
    }
}