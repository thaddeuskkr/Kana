import { Command } from '@sapphire/framework';

export class ClearCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'clear',
            description: 'Clears the queue.',
            preconditions: ['voice', 'sameVoice', 'dispatcher', 'queue']
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
        const dispatcher = this.container.queue.get(interaction.guildId);
        await interaction.reply({ embeds: [this.container.util.embed('success', `Cleared **${dispatcher.queue.length} tracks**.`)] });
        dispatcher.queue.length = 0;
    }

    async whatsappRun({ msg, dispatcher, sameVoice, voice }) {
        if (voice === false) return await msg.reply('You are not in a voice channel.');
        if (sameVoice === false) return await msg.reply('You are not in the same voice channel as the bot.');
        if (!dispatcher) return await msg.reply('There is nothing playing.');
        if (!dispatcher.queue.length) return await msg.reply('There are no tracks in the queue.');
        await msg.reply(`Cleared *${dispatcher.queue.length} tracks*.`);
        dispatcher.queue.length = 0;
    }
}