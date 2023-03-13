import { Command } from '@sapphire/framework';

export class ResetCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'reset',
            description: 'Resets Kana\'s voice state in your server. Useful for stuck tracks, broken players and disconnects.',
            aliases: ['stuck'],
            preconditions: ['voice', 'sameVoice']
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
        await interaction.guild.members.me.voice.disconnect();
        await dispatcher.destroy().catch(() => null);
        await interaction.editReply({ embeds: [this.container.util.embed('success', 'Force stopped playback and disconnected.')] });
    }

    async whatsappRun({ msg, dispatcher, sameVoice, voice, discordUser }) {
        if (!discordUser) return await msg.reply('You are not linked to a Discord account. Use ```/link``` to link your WhatsApp account to your Discord account.');
        if (voice === false) return await msg.reply('You are not in a voice channel.');
        if (sameVoice === false) return await msg.reply('You are not in the same voice channel as the bot.');
        dispatcher.queue.length = 0;
        dispatcher.repeat = 'off';
        dispatcher.stopped = true;
        dispatcher.player.stopTrack();
        await dispatcher.guild.members.me.voice.disconnect();
        await dispatcher.destroy().catch(() => null);
        await msg.reply('Force stopped playback and disconnected.');
    }
}
