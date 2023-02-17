import { Listener } from '@sapphire/framework';
import { ActivityType } from 'discord.js';

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

        this.container.statusRotatorCurrent = 0;
        this.container.presenceUpdateRequired = true;

        // Status rotate (configurable interval)
        setInterval(async () => {
            const motd = await this.container.db.get('motd') || { enabled: false };
            const maintenance = await this.container.db.get('maintenance') || false;
            this.container.motd = motd;
            this.container.maintenance = maintenance;

            if (maintenance && client.user.presence.activities[0].name !== 'maintenance mode') {
                client.user.setPresence({ activities: [{ name: 'maintenance mode', type: ActivityType.Playing }], status: 'dnd' });
                this.container.logger.debug('Presence updated.');
            }
            if (motd.enabled && client.user.presence.activities[0].name !== motd.presence.name) {
                client.user.setPresence({ activities: [motd.presence], status: motd.presence.status });
                this.container.logger.debug('Presence updated.');
            }
            if (!maintenance && !motd.enabled && this.container.presenceUpdateRequired) {
                const activity = this.container.config.activities[this.container.statusRotatorCurrent];
                if (client.user.presence.activities.name !== activity.name) {
                    client.user.setPresence({ activities: [activity], status: activity.status });
                    this.container.logger.debug('Presence updated.');
                }
                this.container.statusRotatorCurrent = this.container.statusRotatorCurrent >= this.container.config.activities.length - 1 ? 0 : this.container.statusRotatorCurrent + 1;
                this.container.presenceUpdateRequired = false;
            }
        }, 5000);

        setInterval(async () => {
            this.container.presenceUpdateRequired = true;
        }, this.container.config.activityRotateDelay * 1000);
    }
}