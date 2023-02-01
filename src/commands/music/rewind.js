import { Command } from '@sapphire/framework';

export class RewindCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'rewind',
            description: 'Restarts the current track. (sets position to 0:00)',
            aliases: ['rw'],
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
        const dispatcher = this.container.queue.get(interaction.guildId);
        await interaction.reply({ embeds: [this.container.util.embed('success', `Restarted **${dispatcher.current.info.title}** - **${dispatcher.current.info.author}**.`)] });
        dispatcher.player.seekTo(0);
    }

    async whatsappRun({ msg, dispatcher, sameVoice, voice, discordUser }) {
        if (!discordUser) return await msg.reply('You are not linked to a Discord account. Use ```/link``` to link your WhatsApp account to your Discord account.');
        if (voice === false) return await msg.reply('You are not in a voice channel.');
        if (sameVoice === false) return await msg.reply('You are not in the same voice channel as the bot.');
        if (!dispatcher) return await msg.reply('There is nothing playing.');
        await msg.reply(`Restarted *${dispatcher.current.info.title}* - *${dispatcher.current.info.author}*.`);
        dispatcher.player.seekTo(0);
    }
}