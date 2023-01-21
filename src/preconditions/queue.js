import { Precondition } from '@sapphire/framework';

export class QueuePrecondition extends Precondition {
    constructor(context, options) {
        super(context, {
            ...options,
            enabled: true,
            name: 'queue'
        });
    }
    async chatInputRun(interaction) {
        return this.checkQueue(interaction);
    }

    async contextMenuRun(interaction) {
        return this.checkQueue(interaction);
    }

    async checkQueue(interaction) {
        const dispatcher = this.container.queue.get(interaction.guildId);
        return !dispatcher.queue.length ? this.error({ message: 'There are no tracks in queue.' }) : this.ok(); 
    }
}