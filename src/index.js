import { SapphireClient, LogLevel, container } from '@sapphire/framework';
import { GatewayIntentBits, Partials } from 'discord.js';
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
        level: process.env.NODE_ENV === 'development' ? LogLevel.Debug : LogLevel.Info
    },
    presence: { activities: [config.activities[0]], status: config.activities[0].status }
});

const whatsapp = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, executablePath: process.argv.includes('--docker') ? '/usr/bin/google-chrome' : undefined },
});

client.version = version;
container.runtimeArguments = process.argv.slice(2);
container.whatsapp = whatsapp;
container.config = config;
container.util = Util;
container.queue = new Queue(client);
container.db = new Keyv(config.databaseUrl, { collection: 'kanadb1' });
container.shoukaku = new Shoukaku(new Connectors.DiscordJS(client), config.lavalink, {
    userAgent: `Kana-${version}`,
    reconnectTries: 10
});

process.on('unhandledRejection', (error) => {
    container.logger.error(error);
});

if (!container.runtimeArguments.includes('--no-discord') && !container.runtimeArguments.includes('-nd')) client.login(config.discordToken);
if (!container.runtimeArguments.includes('--no-whatsapp') && !container.runtimeArguments.includes('-nw')) whatsapp.initialize();