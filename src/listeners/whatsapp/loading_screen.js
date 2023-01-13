import { Listener, container } from '@sapphire/framework';

export class WhatsappLoadingScreenListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            emitter: container.whatsapp,
            event: 'loading_screen',
            name: 'whatsappLoadingScreen'
        });
    }
    run(percent, message) {
        this.container.logger.debug(`WhatsApp loading... ${percent}% | ${message}`);
    }
}