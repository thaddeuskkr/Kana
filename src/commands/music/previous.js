import { Command } from '@sapphire/framework';

export class PreviousCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'previous',
            description: 'Returns to the previous track.',
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
        await interaction.reply({ embeds: [this.container.util.embed('success', `Returned to the previous track **${dispatcher.current.info.title}** - **${dispatcher.current.info.author}**${dispatcher.repeat === 'one' ? ' and turned off track repeat' : ''}.`)] });
        if (dispatcher.repeat === 'one') dispatcher.repeat = 'off';
        dispatcher.queue.unshift(dispatcher.current);
        dispatcher.queue.unshift(dispatcher.previous[0]);
        await dispatcher.player.stopTrack();
    }

    async whatsappRun({ msg, dispatcher, sameVoice, voice, discordUser }) {
        if (!discordUser) return await msg.reply('You are not linked to a Discord account. Use ```/link``` to link your WhatsApp account to your Discord account.');
        if (voice === false) return await msg.reply('You are not in a voice channel.');
        if (sameVoice === false) return await msg.reply('You are not in the same voice channel as the bot.');
        if (!dispatcher) return await msg.reply('There is nothing playing.');
        await msg.reply(`Returned to the previous track *${dispatcher.current.info.title}* - *${dispatcher.current.info.author}*${dispatcher.repeat === 'one' ? ' and turned off track repeat' : ''}.`);
        if (dispatcher.repeat === 'one') dispatcher.repeat = 'off';
        dispatcher.queue.unshift(dispatcher.current);
        dispatcher.queue.unshift(dispatcher.previous[0]);
        await dispatcher.player.stopTrack();
    }
}