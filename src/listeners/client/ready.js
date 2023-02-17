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

            if (maintenance && client.user.presence.activities !== [{ name: 'maintenance mode', type: ActivityType.Playing }]) {
                client.user.setPresence({ activities: [{ name: 'maintenance mode', type: ActivityType.Playing }], status: 'dnd' });
                this.container.logger.debug('Presence updated.');
            }
            if (motd.enabled && client.user.presence.activities !== [{ name: motd.presence.name, type: motd.presence.type }]) {
                client.user.setPresence({ activities: [motd.presence], status: motd.presence.status });
                this.container.logger.debug('Presence updated.');
            }
            if (!maintenance && !motd.enabled && this.container.presenceUpdateRequired) {
                const activity = this.container.config.activities[this.container.statusRotatorCurrent];
                if (client.user.presence.activities !== [{ name: activity.name, type: activity.type }]) {
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
        /*
        this.container.statusRotatorCurrent = 0;
        this.container.logger.info('Initialising presence rotator.');
        this.container.statusRotator = setInterval(async () => {
            const activity = this.container.config.activities[this.container.statusRotatorCurrent];
            client.user.setPresence({ activities: [activity], status: activity.status });
            this.container.statusRotatorCurrent = this.container.statusRotatorCurrent >= this.container.config.activities.length - 1 ? 0 : this.container.statusRotatorCurrent + 1;
        }, this.container.config.activityRotateDelay * 1000);
        this.container.currents = {};
        this.container.motdRefresher = setInterval(async () => { // Refresh MOTD every 5 seconds
            let changed = false;
            this.container.motd = await this.container.db.get('motd') || { enabled: false };
            const maintenance = await this.container.db.get('maintenance');
            if (maintenance !== this.container.currents.maintenance) changed = true;
            this.container.currents.maintenance = maintenance;
            if (this.container.motd.enabled !== this.container.currents.motd.enabled) changed = true;
            this.container.currents.motd = this.container.motd.enabled;
            if (maintenance == true && changed) { // Set presence to maintenance if maintenance is enabled
                this.container.logger.info('Maintenance mode enabled.');
                clearInterval(this.container.statusRotator);
                this.container.statusRotator = null;
                await client.user.setPresence({ activities: [{ name: 'maintenance mode', type: ActivityType.Playing }], status: 'dnd' });
                changed = false;
            } else if (this.container.motd.enabled == true && changed) { // Set presence to MOTD presence if MOTD is enabled
                this.container.logger.info('MOTD enabled.');
                clearInterval(this.container.statusRotator);
                this.container.statusRotator = null;
                await client.user.setPresence({ activities: [this.container.motd.presence], status: this.container.motd.presence.status });
                changed = false;
            } else if (this.container.motd.enabled == false && maintenance == false && this.container.statusRotator == null) { // Set presence to status rotator if MOTD is disabled
                this.container.logger.info('Initialising presence rotator.');
                this.container.statusRotator = setInterval(async () => {
                    const activity = this.container.config.activities[this.container.statusRotatorCurrent];
                    client.user.setPresence({ activities: [activity], status: activity.status });
                    this.container.statusRotatorCurrent = this.container.statusRotatorCurrent >= this.container.config.activities.length - 1 ? 0 : this.container.statusRotatorCurrent + 1;
                }, this.container.config.activityRotateDelay * 1000);
                changed = false;
            }
        }, 5000);
        */
    }
}