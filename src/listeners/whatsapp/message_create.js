import { Listener, container } from '@sapphire/framework';
import { ChannelType } from 'discord-api-types/v10';

export class MessageCreateListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            emitter: container.whatsapp,
            event: 'message_create',
            name: 'whatsappMessageCreate'
        });
    }
    async run(msg) {
        if (!msg.body || msg.from === container.whatsapp.info.wid._serialized) return;
        let chatPrefixes = await container.db.get(`${msg.from}-prefix`);
        if (!chatPrefixes) {
            await container.db.set(`${msg.from}-prefix`, []);
            chatPrefixes = [];
        }
        const globalPrefix = container.config.whatsappPrefix;
        let prefix;
        if (msg.body.startsWith(globalPrefix) && typeof chatPrefix == 'undefined') prefix = globalPrefix;
        else for (const chatPrefix of chatPrefixes) {
            if (msg.body.startsWith(chatPrefix)) prefix = chatPrefix;
            break;
        }
        if (!prefix) return;
        let args = msg.body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = container.stores.get('commands').get(commandName);
        if (!command) {
            await msg.react('❌');
            return msg.reply(`Command \`\`\`${commandName}\`\`\` not found.`);
        } else if (!command.whatsappRun) {
            await msg.react('❌');
            return msg.reply(`Command \`\`\`${commandName}\`\`\` cannot be used on WhatsApp.`);
        }
        let users = await container.db.get('users');
        if (!users) {
            users = {};
            await container.db.set('users', users);
        }
        const user = Object.values(users).find(u => u.whatsapp === (msg.from.includes('@g.us') ? msg.author.replace('@c.us', '') : msg.from.replace('@c.us', '')));
        const discordUser = container.client.users.cache.get(user.discord) || undefined;

        const voiceChannels = [];
        this.container.client.channels.cache.filter((channel) => channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice).forEach((channel) => {
            if (channel.members.find((member) => member.id === discordUser.id)) voiceChannels.push(channel);
        });
        
        // Preconditions
        let voice = false;
        let sameVoice = false;
        if (voiceChannels.length > 0) voice = true;
        for (const channels of voiceChannels) if (channels.members.find((member) => member.id === discordUser.id) && channels.members.find((member) => member.id === this.container.client.user.id)) sameVoice = true;
        const defaultVc = voiceChannels[0];
        const dispatcher = this.container.queue.get(defaultVc.guild.id);

        try {
            command.whatsappRun({ args, msg, prefix, commandName, user, discordUser, voiceChannels, voice, sameVoice, defaultVc, dispatcher, author: msg.from.includes('@g.us') ? msg.author.replace('@c.us', '') : msg.from.replace('@c.us', '') });
        } catch (err) {
            await msg.react('❌');
            return msg.reply(`An error occurred while executing command \`\`\`${commandName}\`\`\`:\n\`\`\`${err}\`\`\``);
        }
    }
}