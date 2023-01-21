import { Command } from '@sapphire/framework';

export class StopCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'stop',
            description: 'Stops the music in your server.',
            preconditions: ['voice', 'sameVoice', 'dispatcher']
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => 
            builder
                .setName(this.name)
                .setDescription(this.description)
                .setDMPermission(false)
        );
    }
    
    async chatInputRun(interaction) {
        await interaction.deferReply();
        const dispatcher = this.container.queue.get(interaction.guildId);
        dispatcher.queue.length = 0;
        dispatcher.repeat = 'off';
        dispatcher.stopped = true;
        dispatcher.player.stopTrack();
        await interaction.editReply({ embeds: [this.container.util.embed('success', 'Stopped the player.')] });
    }

    async whatsappRun({ msg, dispatcher, sameVoice, voice, discordUser }) {
        if (!discordUser) return await msg.reply('You are not linked to a Discord account. Use ```/link``` to link your WhatsApp account to your Discord account.');
        if (voice === false) return await msg.reply('You are not in a voice channel.');
        if (sameVoice === false) return await msg.reply('You are not in the same voice channel as the bot.');
        if (!dispatcher) return await msg.reply('There is nothing playing.');
        dispatcher.queue.length = 0;
        dispatcher.repeat = 'off';
        dispatcher.stopped = true;
        dispatcher.player.stopTrack();
        await msg.reply('Stopped the player.');
    }
}
