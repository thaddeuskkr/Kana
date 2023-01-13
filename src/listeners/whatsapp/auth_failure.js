import { Listener, container } from '@sapphire/framework';

export class WhatsappAuthFailureListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            emitter: container.whatsapp,
            event: 'auth_failure',
            name: 'whatsappAuthFailure'
        });
    }
    run(msg) {
        this.container.logger.error(`WhatsApp authentication failure: ${msg}`);
    }
}