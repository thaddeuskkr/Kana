import { Command } from '@sapphire/framework';

export class PauseCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'pause',
            description: 'Pauses the currently playing track.',
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
        if (dispatcher.player.paused === true) return interaction.reply({ embeds: [this.container.util.embed('error', `**${dispatcher.current.info.title}** - **${dispatcher.current.info.author}** is already paused.`)] });
        await dispatcher.player.setPaused(true);
        await interaction.reply({ embeds: [this.container.util.embed('success', `Paused **${dispatcher.current.info.title}** - **${dispatcher.current.info.author}**.`)] });
    }

    async whatsappRun({ msg, dispatcher, sameVoice, voice, discordUser }) {
        if (!discordUser) return await msg.reply('You are not linked to a Discord account. Use ```/link``` to link your WhatsApp account to your Discord account.');
        if (voice === false) return await msg.reply('You are not in a voice channel.');
        if (sameVoice === false) return await msg.reply('You are not in the same voice channel as the bot.');
        if (!dispatcher) return await msg.reply('There is nothing playing.');
        if (dispatcher.player.paused === true) return msg.reply('*${dispatcher.current.info.title}* - *${dispatcher.current.info.author}* is already paused.');
        await dispatcher.player.setPaused(true);
        await msg.reply(`Paused *${dispatcher.current.info.title}* - *${dispatcher.current.info.author}*.`);
    }
}
