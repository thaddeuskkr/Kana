import { Command } from '@sapphire/framework';

export class RepeatCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'repeat',
            description: 'Turns on or off repeat for the current track or the entire queue.',
            preconditions: ['voice', 'sameVoice', 'dispatcher']
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => 
            builder
                .setName(this.name)
                .setDescription(this.description)
                .setDMPermission(false)
                .addStringOption((option) => 
                    option
                        .setName('mode')
                        .setDescription('Whether to repeat the queue, or only the currently playing track, or to disable repeat.')
                        .setRequired(true)
                        .addChoices(
                            { name: 'one (Currently playing track)', value: 'one' },
                            { name: 'all (The whole queue)', value: 'all' },
                            { name: 'off (Disabled)', value: 'off' }
                        )
                )
        );
    }
    
    async chatInputRun(interaction) {
        const dispatcher = this.container.queue.get(interaction.guildId);
        const mode = interaction.options.getString('mode');
        let text = '';
        switch(mode) {
        case 'one':
            text = 'Now repeating the currently playing track.';
            break;
        case 'all':
            if (!dispatcher.queue.length) {
                return interaction.reply({ embeds: [this.container.util.embed('error', 'There are no tracks in queue.')] });
            }
            text = 'Now repeating the whole queue.';
            break;
        case 'off':
            text = 'Disabled repeat.';
            break;
        default:
            return interaction.reply({ embeds: [this.container.util.embed('error', 'Unrecognised option.')] }); 
        }
        dispatcher.repeat = mode;
        await interaction.reply({ embeds: [this.container.util.embed('success', text)] });
    }

    async whatsappRun({ msg, args, dispatcher, sameVoice, voice, discordUser }) {
        if (!discordUser) return await msg.reply('You are not linked to a Discord account. Use ```/link``` to link your WhatsApp account to your Discord account.');
        if (voice === false) return await msg.reply('You are not in a voice channel.');
        if (sameVoice === false) return await msg.reply('You are not in the same voice channel as the bot.');
        if (!dispatcher) return await msg.reply('There is nothing playing.');
        const mode = args[0];
        if (mode !== 'one' && mode !== 'all' && mode !== 'off') return await msg.reply('Invalid ```mode``` argument. Accepts \'one\', \'all\' or \'off\'.');
        let text = '';
        switch(mode) {
        case 'one':
            text = 'Now repeating the currently playing track.';
            break;
        case 'all':
            if (!dispatcher.queue.length) {
                return msg.reply('There are no tracks in queue, therefore this mode is disabled.');
            }
            text = 'Now repeating the whole queue.';
            break;
        case 'off':
            text = 'Disabled repeat.';
            break;
        default:
            return msg.reply('Unrecognised option.');
        }
        dispatcher.repeat = mode;
        await msg.reply(text);
    }
}
