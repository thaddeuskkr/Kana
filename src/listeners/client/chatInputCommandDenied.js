import { Listener } from '@sapphire/framework';

export class ChatInputCommandDeniedListener extends Listener {
    constructor(context, options) {
        super(context, {
            ...options,
            event: 'chatInputCommandDenied'
        });
    }
    run(error, { interaction }) {
        if (interaction.deferred) return interaction.editReply({ embeds: [this.container.util.embed('error', `${error.message}`)] });
        return interaction.reply({ embeds: [this.container.util.embed('error', `${error.message}`)], ephemeral: true });
    }
}