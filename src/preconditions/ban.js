import { AllFlowsPrecondition } from '@sapphire/framework';

export class BanPrecondition extends AllFlowsPrecondition {
    constructor(context, options) {
        super(context, {
            ...options,
            position: 30
        });
    }

    chatInputRun(interaction) {
        return this.doBanListCheck(interaction.user.id, interaction.guildId, interaction.channel.id);
    }

    contextMenuRun(interaction) {
        return this.doBanListCheck(interaction.user.id, interaction.guildId, interaction.channel.id);
    }

    async doBanListCheck(u, g, c) {
        let banned = await this.container.db.get('banned');
        if (!banned) {
            await this.container.db.set('banned', []);
            return this.ok();
        }
        const userBan = banned.find(o => o.ids.includes(u));
        const guildBan = banned.find(o => o.ids.includes(g));
        const channelBan = banned.find(o => o.ids.includes(c));
        if (userBan) return this.error({ message: `You are currently **banned** from using Kana's commands. Reason: \`${userBan.reason}\`` });
        if (guildBan) return this.error({ message: `Your server is currently **banned** from using Kana's commands. Reason: \`${guildBan.reason}\`` });
        if (channelBan) return this.error({ message: `This channel is currently **banned** from using Kana's commands. Reason: \`${channelBan.reason}\`` });
        return this.ok();
    }
}