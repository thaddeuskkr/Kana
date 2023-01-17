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

export class LinkCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'link',
            description: 'Links your WhatsApp account to your Discord account, or vice-versa.'
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => 
            builder
                .setName(this.name)
                .setDescription(this.description)
                .setDMPermission(true)
                .addIntegerOption((option) => 
                    option
                        .setName('code').setDescription('If confirming linking, input the code you got from WhatsApp here.')
                        .setRequired(false)
                )
        );
    }
    
    async chatInputRun(interaction) {
        const confirmCode = interaction.options.getInteger('code');
        let users = await this.container.db.get('users');
        if (!users) {
            users = {};
        }
        for (const user of Object.values(users)) {
            if (user.discord === interaction.user.id) return interaction.reply({ embeds: [this.container.util.embed('error', 'Your account is already linked. Use `/unlink` before running this command.')] });
        }
        let verification = await this.container.db.get('verification');
        if (!verification) {
            verification = {};
        }
        if (confirmCode) {
            const waUser = verification[String(confirmCode)]?.whatsapp;
            if (!waUser) {
                return interaction.reply({ embeds: [this.container.util.embed('error', 'Invalid authentication code.')], ephemeral: true });
            }
            delete verification[String(confirmCode)];
            const newUserId = users[Object.keys(users)[Object.keys(users).length - 1]]?.id + 1 || 0;
            users[String(newUserId)] = {
                id: newUserId,
                whatsapp: waUser,
                discord: interaction.user.id,
            };
            await this.container.db.set('users', users);
            const addedUser = users[String(newUserId)];
            if (!addedUser) return interaction.reply({ embeds: [this.container.util.embed('error', 'An error occurred while adding your user to the database.')], ephemeral: true });
            interaction.reply({ embeds: [this.container.util.embed('success', `Successfully linked **${addedUser.whatsapp}** on WhatsApp to **<@${addedUser.discord}>** on Discord.`)], ephemeral: true });
            return;
        }
        const code = this.container.util.generateCode();
        const existing = Object.values(verification).find((v) => v.discord === interaction.user.id);
        if (existing) delete verification[String(existing.code)];
        verification[String(code)] = { code, discord: interaction.user.id };
        await this.container.db.set('verification', verification);
        interaction.reply({ embeds: [this.container.util.embed('info', `Please text this command to **[+65 6286 0768 (click me!)](https://wa.me/6562860768)** on WhatsApp: \`/link ${code}\``)], ephemeral: true });
    }

    async whatsappRun({ args, msg, author }) {
        let users = await this.container.db.get('users');
        if (!users) {
            users = {};
        }
        for (const user of Object.values(users)) {
            if (user.whatsapp === author) return msg.reply('Your account is already linked. Please ```/unlink``` your account first.');
        }
        let verification = await this.container.db.get('verification');
        if (!verification) {
            verification = {};
        }
        if (!args.length) {
            const code = this.container.util.generateCode();
            verification[String(code)] = { code, whatsapp: author };
            await this.container.db.set('verification', verification);
            return msg.reply(`*Please use the following slash command in any channel that the bot can access (including DMs):*\n\`\`\`/link ${code}\`\`\``);
        }
        const dUser = verification[String(args[0])]?.discord;
        if (!dUser) {
            return msg.reply('Invalid authentication code.');
        }
        delete verification[String(args[0])];
        const newUserId = users[Object.keys(users)[Object.keys(users).length - 1]]?.id + 1 || 0;
        users[String(newUserId)] = {
            id: newUserId,
            whatsapp: author,
            discord: dUser,
        };
        await this.container.db.set('users', users);
        msg.reply(`Successfully linked \`\`\`${author}\`\`\` on WhatsApp to user with ID \`\`\`${dUser}\`\`\` on Discord.`);
    }
}