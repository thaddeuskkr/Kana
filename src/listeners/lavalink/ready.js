import { Listener, container } from '@sapphire/framework';

export class ShoukakuReadyListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            emitter: container.shoukaku,
            event: 'ready',
            name: 'shoukakuReady'
        });
    }
    run(name) {
        this.container.logger.info(`Connected to Lavalink node '${name}'`);
    }
}