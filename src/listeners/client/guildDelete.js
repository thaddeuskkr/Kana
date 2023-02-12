import { Listener } from '@sapphire/framework';

export class GuildDeleteListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            event: 'guildDelete'
        });
    }
    async run (guild) {
        this.container.logger.info(`Guild removed: ${guild.name} (${guild.id})`);
        this.container.webhook.send({ embeds: [this.container.util.embed('info', `Removed from server: **${guild.name}** \`${guild.id}\``)] });
    }
}