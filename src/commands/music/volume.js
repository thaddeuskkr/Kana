import { Command } from '@sapphire/framework';

export class VolumeCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'volume',
            description: 'Changes the volume of the player.',
            aliases: ['vol'],
            preconditions: ['voice', 'sameVoice', 'dispatcher']
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => 
            builder
                .setName(this.name)
                .setDescription(this.description)
                .setDMPermission(false)
                .addIntegerOption((option) => 
                    option
                        .setName('new-volume')
                        .setDescription('Sets the new volume of the player (%), accepts an integer between 0 and 200.')
                        .setRequired(false)
                )
        );
    }
    
    async chatInputRun(interaction) {
        const dispatcher = this.container.queue.get(interaction.guildId);
        const nv = interaction.options.getInteger('new-volume');
        if (!nv && nv !== 0) return interaction.reply({ embeds: [this.container.util.embed('info', `The current volume is **${dispatcher.player.filters.volume * 100}%**.`)] });
        if (!VolumeCommand.inRange(nv, this.container.config.minVol || 0, this.container.config.maxVol || 200)) {
            return interaction.reply({ embeds: [this.container.util.embed('error', `Out of volume range (**${this.container.config.minVol}%** to **${this.container.config.maxVol}%**)`)] });
        }
        dispatcher.player.setVolume(nv / 100);
        await interaction.reply({ embeds: [this.container.util.embed('success', `Volume set to **${nv}%**.`)] });
    }

    async whatsappRun({ msg, dispatcher, sameVoice, voice, args, discordUser }) {
        if (!discordUser) return await msg.reply('You are not linked to a Discord account. Use ```/link``` to link your WhatsApp account to your Discord account.');
        if (voice === false) return await msg.reply('You are not in a voice channel.');
        if (sameVoice === false) return await msg.reply('You are not in the same voice channel as the bot.');
        if (!dispatcher) return await msg.reply('There is nothing playing.');
        if (!args[0]) {
            return msg.reply(`The current volume is *${dispatcher.player.filters.volume * 100}%*.`);
        }
        if (isNaN(Number(args[0]))) return await msg.reply('Invalid new volume.');
        const newVol = parseInt(args[0]);
        if (!VolumeCommand.inRange(newVol, this.container.config.minVol || 0, this.container.config.maxVol || 200)) {
            return msg.reply(`Out of volume range (**${this.container.config.minVol}%** to **${this.container.config.maxVol}%**)`);
        }
        dispatcher.player.setVolume(newVol / 100);
        await msg.reply(`Volume set to *${newVol}%*.`);
    }

    static inRange(x, min, max) {
        return (x - min) * ( x - max) <= 0;
    }
}
