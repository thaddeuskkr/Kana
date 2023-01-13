import { Listener, container } from '@sapphire/framework';

export class ShoukakuDebugListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            emitter: container.shoukaku,
            event: 'debug',
            name: 'shoukakuDebug'
        });
    }
    run(_, message) {
        this.container.logger.debug(message);
    }
}