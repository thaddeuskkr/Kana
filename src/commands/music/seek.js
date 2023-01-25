import { Command } from '@sapphire/framework';
import prettyms from 'pretty-ms';

export class SeekCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'seek',
            description: 'Seeks to a specified position in a track.',
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
                        .setName('position')
                        .setDescription('Position to seek to (format: hh:mm:ss • e.g. 1:00:00, 30, 7:47)')
                        .setRequired(true)
                )
        );
    }
    
    async chatInputRun(interaction) {
        const position = interaction.options.getString('position');
        const ms = SeekCommand.convertToMs(position);
        if (!ms) return await interaction.reply({ embeds: [this.container.util.embed('error', 'Invalid position.')] });
        const dispatcher = this.container.queue.get(interaction.guildId);
        await interaction.reply({ embeds: [this.container.util.embed('success', `Seeked to **\`${prettyms(ms, { colonNotation: true, secondsDecimalDigits: 0 })}\`**.`)] });
        dispatcher.player.seekTo(ms);
    }

    async whatsappRun({ msg, args, dispatcher, sameVoice, voice, discordUser }) {
        if (!discordUser) return await msg.reply('You are not linked to a Discord account. Use ```/link``` to link your WhatsApp account to your Discord account.');
        if (voice === false) return await msg.reply('You are not in a voice channel.');
        if (sameVoice === false) return await msg.reply('You are not in the same voice channel as the bot.');
        if (!dispatcher) return await msg.reply('There is nothing playing.');
        const position = args[0];
        const ms = SeekCommand.convertToMs(position);
        if (!ms) return await msg.reply('Invalid position.');
        await msg.reply(`Seeked to \`\`\`${prettyms(ms, { colonNotation: true, secondsDecimalDigits: 0 })}\`\`\`.`);
        dispatcher.player.seekTo(ms);
    }

    static convertToMs(position) {
        const parts = position.split(':').reverse();
        let ms = 0;
        for (let i = 0; i < parts.length; i++) {
            if (isNaN(parseInt(parts[i]))) return null;
            ms += parseInt(parts[i]) * (60 ** i);
        }
        return ms * 1000;
    }
}