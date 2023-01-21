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