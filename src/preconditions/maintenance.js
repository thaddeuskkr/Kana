import { AllFlowsPrecondition } from '@sapphire/framework';

export class MaintenanceModePrecondition extends AllFlowsPrecondition {
    constructor(context, options) {
        super(context, {
            ...options,
            position: 20
        });
    }

    chatInputRun(interaction) {
        return this.maintenanceCheck(interaction.user.id);
    }

    contextMenuRun(interaction) {
        return this.maintenanceCheck(interaction.user.id);
    }

    async maintenanceCheck(u) {
        let maintenance = await this.container.db.get('maintenance');
        if (!maintenance) maintenance = false;
        if (maintenance == true && !this.container.config.ownerIds.includes(u)) return this.error({ message: 'Kana is currently in maintenance mode.' });
        return this.ok();
    }
}