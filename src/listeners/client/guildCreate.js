import { Listener } from '@sapphire/framework';

export class GuildCreateListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            event: 'guildCreate'
        });
    }
    async run (guild) {
        this.container.logger.info(`New guild: ${guild.name} (${guild.id})`);
        this.container.webhook.send({ embeds: [this.container.util.embed('info', `Added to server: **${guild.name}** \`${guild.id}\``, false)] });
    }
}