import { Listener, container } from '@sapphire/framework';

export class WhatsappReadyListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            emitter: container.whatsapp,
            event: 'ready',
            name: 'whatsappReady'
        });
    }
    run() {
        this.container.logger.info(`WhatsApp connected! | ${container.whatsapp.info.pushname} (${container.whatsapp.info.wid.user})`);
    }
}