import { Listener, container } from '@sapphire/framework';

export class WhatsappAuthenticatedListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            emitter: container.whatsapp,
            event: 'authenticated',
            name: 'whatsappAuthenticated'
        });
    }
    run() {
        this.container.logger.info('Authenticated with WhatsApp!');
    }
}