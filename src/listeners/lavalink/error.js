import { Listener, container } from '@sapphire/framework';

export class ShoukakuErrorListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            emitter: container.shoukaku,
            event: 'error',
            name: 'shoukakuError'
        });
    }
    run(_, error) {
        this.container.logger.error(error);
    }
}