import { Listener, container } from '@sapphire/framework';

export class AutoPosterErrorListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            emitter: container.autoposter,
            event: 'error',
            name: 'autoposterError'
        });
    }
    run(error) {
        this.container.logger.error(`An error occurred while posting stats to top.gg: ${error}`);
    }
}