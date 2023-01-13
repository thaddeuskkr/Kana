import { Precondition } from '@sapphire/framework';

export class SameVoicePrecondition extends Precondition {
    constructor(context, options) {
        super(context, {
            ...options,
            enabled: true,
            name: 'sameVoice'
        });
    }
    async chatInputRun(interaction) {
        return this.checkInSameVc(interaction.member, interaction.guild.members.me, interaction);
    }

    async contextMenuRun(interaction) {
        return this.checkInSameVc(interaction.member, interaction.guild.members.me, interaction);
    }

    async checkInSameVc(member, me, interaction) {
        if (me.voice.channelId === null || !this.container.queue.get(interaction.guildId)?.current) return this.ok();
        return member.voice.channel.id === me.voice.channel.id ? this.ok() : this.error({ message: `Join <#${me.voice.channel.id}> before executing this command.` });
    }
}