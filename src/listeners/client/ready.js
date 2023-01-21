import { Listener } from '@sapphire/framework';

export class ReadyListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            once: true,
            event: 'ready'
        });
    }
    async run (client) {
        const { username, id } = client.user;
        this.container.logger.info(`Logged in as ${username} (${id})`);
        let current = 0;
        setInterval(async() => {
            const activity = this.container.config.activities[current];
            client.user.setPresence({ activities: [activity], status: activity.status });
            current = current >= this.container.config.activities.length - 1 ? 0 : current + 1;
        }, this.container.config.activityRotateDelay * 1000);
    }
}