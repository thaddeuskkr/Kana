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
        if (msg.from === container.whatsapp.info.wid._serialized) return;
        const chat = await msg.getChat();
        await chat.sendSeen(); // Marks all messages as read
        if (!msg.body) return;
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
        const u = msg.from.includes('@g.us') ? msg.author.replace('@c.us', '') : msg.from.replace('@c.us', '');
        let maintenance = await this.container.db.get('maintenance');
        let banned = await this.container.db.get('banned');
        if (!banned) banned = [];
        if (!maintenance) maintenance = false;
        if (maintenance == true && !this.container.config.ownerIds.includes(u)) return msg.reply('Kana is currently in maintenance mode. Please try again later.');
        const userBan = banned.find(o => o.ids.includes(u));
        if (userBan) return msg.reply(`You are currently *banned* from using Kana's commands. Reason: _${userBan.reason}_`);
        const commandName = args.shift().toLowerCase();
        const command = container.stores.get('commands').get(commandName) || container.stores.get('commands').find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
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
        const discordUser = user ? container.client.users.cache.get(user.discord) || undefined : undefined;

        const voiceChannels = [];
        let dispatcher = null;
        let voice = false;
        let sameVoice = false;
        let defaultVc = null;
        if (discordUser) {
            this.container.client.channels.cache.filter((channel) => channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice).forEach((channel) => {
                if (channel.members.find((member) => member.id === discordUser.id)) voiceChannels.push(channel);
            });
        
            // Preconditions
            if (voiceChannels.length > 0) voice = true;
            for (const channels of voiceChannels) if (channels.guild.members.cache.get(this.container.client.user.id).voice.channelId == null || (channels.members.find((member) => member.id === discordUser.id) && channels.members.find((member) => member.id === this.container.client.user.id))) sameVoice = true;
            defaultVc = voiceChannels[0];
            dispatcher = voiceChannels[0] ? this.container.queue.get(defaultVc?.guild?.id) : null;
        }

        try {
            this.container.totalCommandsInvoked++;
            command.whatsappRun({ args, msg, prefix, commandName, user, discordUser, voiceChannels, voice, sameVoice, defaultVc, dispatcher, author: msg.from.includes('@g.us') ? msg.author.replace('@c.us', '') : msg.from.replace('@c.us', '') });
        } catch (err) {
            await msg.react('❌');
            return msg.reply(`An error occurred while executing command \`\`\`${commandName}\`\`\`:\n\`\`\`${err}\`\`\``);
        }
    }
}