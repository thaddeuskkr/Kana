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

export class UnlinkCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'unlink',
            description: 'Unlinks your WhatsApp account to your Discord account, or vice-versa.'
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
        let users = await this.container.db.get('users');
        if (!users) {
            users = {};
        }
        const user = Object.values(users).find(u => u.discord == interaction.user.id);
        if (!user) return interaction.reply({ embeds: [this.container.util.embed('error', 'Your account is not linked.')], ephemeral: true });
        delete users[String(user.id)];
        await this.container.db.set('users', users);
        return interaction.reply({ embeds: [this.container.util.embed('success', `Successfully unlinked your account - \`${user.whatsapp}\`.`)], ephemeral: true });
    }

    async whatsappRun({ msg, author }) {
        let users = await this.container.db.get('users');
        if (!users) {
            users = {};
        }
        const user = Object.values(users).find(u => u.whatsapp == author);
        if (!user) return msg.reply('Your account is not linked.');
        delete users[String(user.id)];
        await this.container.db.set('users', users);
        return msg.reply(`Successfully unlinked your account - \`\`\`${user.discord}\`\`\`.`);
    }
}