import { Precondition } from '@sapphire/framework';

export class DispatcherPrecondition extends Precondition {
    constructor(context, options) {
        super(context, {
            ...options,
            enabled: true,
            name: 'dispatcher'
        });
    }
    async chatInputRun(interaction) {
        return this.checkDispatcher(interaction);
    }

    async contextMenuRun(interaction) {
        return this.checkDispatcher(interaction);
    }

    async checkDispatcher(interaction) {
        const dispatcher = this.container.queue.get(interaction.guildId);
        if (!dispatcher || !dispatcher?.current) return this.error({ message: 'There is nothing playing.' });
        else return this.ok();
    }
}