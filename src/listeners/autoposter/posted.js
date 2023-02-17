import { Listener, container } from '@sapphire/framework';

export class AutoPosterPostedListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            emitter: container.autoposter,
            event: 'posted',
            name: 'autoposterPosted'
        });
    }
    run() {
        this.container.logger.debug(`Posted stats to top.gg | ${container.client.guilds.cache.size} servers, ${container.client.users.cache.size} users`);
    }
}