import { Command } from '@sapphire/framework';

export class ShuffleCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'shuffle',
            description: 'Shuffles the queue.',
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
        dispatcher.queue = dispatcher.queue.sort(() => Math.random() - 0.5);
        await interaction.reply({ embeds: [this.container.util.embed('success', `Shuffled **${dispatcher.queue.length} tracks**.`)] });
    }

    async whatsappRun({ msg, dispatcher, sameVoice, voice }) {
        if (voice === false) return await msg.reply('You are not in a voice channel.');
        if (sameVoice === false) return await msg.reply('You are not in the same voice channel as the bot.');
        if (!dispatcher) return await msg.reply('There is nothing playing.');
        if (!dispatcher.queue.length) return await msg.reply('There are no tracks in the queue.');
        dispatcher.queue = dispatcher.queue.sort(() => Math.random() - 0.5);
        await msg.reply(`Shuffled *${dispatcher.queue.length} tracks*.`);
    }
}
