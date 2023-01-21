import { Listener } from '@sapphire/framework';

export class ErrorListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            once: false,
            event: 'error'
        });
    }
    async run (error) {
        this.container.logger.error(error);
    }
}