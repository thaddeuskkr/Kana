/*
    Kana, a Discord bot with WhatsApp integrations and commands.
    Copyright (C) 2023 | thaddeus kuah <contact@tkkr.one>

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

import { SapphireClient, LogLevel, container } from '@sapphire/framework';
import { GatewayIntentBits, Partials, WebhookClient } from 'discord.js';
import { Shoukaku, Connectors } from 'shoukaku';
import { createRequire } from 'module';
import Keyv from 'keyv';
import wweb from 'whatsapp-web.js';
const { Client, LocalAuth } = wweb;

// File imports
import { Queue, Util } from './util.js';
import config from './config.js';
const require = createRequire(import.meta.url);
const { version } = require('../package.json');

// Sapphire plugins
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-hmr/register';
import '@sapphire/plugin-pattern-commands/register';
import '@sapphire/plugin-subcommands/register';

const client = new SapphireClient({
    intents: [
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.User,
        Partials.GuildMember,
        Partials.Message,
    ],
    logger: {
        level: String(process.env.NODE_ENV).toLowerCase() === 'development' ? LogLevel.Debug : LogLevel.Info
    },
    presence: { activities: [config.activities[0]], status: config.activities[0].status }
});

const whatsapp = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
});

client.version = version;
container.runtimeArguments = process.argv.slice(2);
container.whatsapp = whatsapp;
container.config = config;
container.util = Util;
container.queue = new Queue(client);
container.webhook = new WebhookClient({ url: config.webhook });
container.db = new Keyv(config.databaseUrl, { collection: 'kanadb1' });
container.shoukaku = new Shoukaku(new Connectors.DiscordJS(client), config.lavalink, {
    userAgent: `Kana-${version}`,
    reconnectTries: 10
});

if (container.config.motd) container.motd = container.config.motd;
else container.motd = { enabled: false };

process.on('unhandledRejection', (error) => {
    container.logger.error(error);
});

if (!container.runtimeArguments.includes('--no-discord') && !container.runtimeArguments.includes('-nd')) client.login(config.discordToken);
if (!container.runtimeArguments.includes('--no-whatsapp') && !container.runtimeArguments.includes('-nw')) whatsapp.initialize();