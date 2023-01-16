import { Precondition } from '@sapphire/framework';

export class OwnerPrecondition extends Precondition {
    constructor(context, options) {
        super(context, {
            ...options,
            enabled: true,
            name: 'owner'
        });
    }
    async chatInputRun(interaction) {
        return this.checkOwner(interaction.user.id);
    }

    async contextMenuRun(interaction) {
        return this.checkOwner(interaction.user.id);
    }

    async checkOwner(userId) {
        return this.container.config.ownerIds.includes(userId) ? this.ok() : this.error({ message: 'You do not have sufficient permissions to use this command.' });
    }
}