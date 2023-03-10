import { Command } from '@sapphire/framework';

export class MoveCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'move',
            description: 'Moves a certain track from one index to another in the queue.',
            aliases: ['mv'],
            preconditions: ['voice', 'sameVoice', 'dispatcher', 'queue']
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
                        .setName('oldPosition')
                        .setDescription('Index of the track that you want to move.')
                        .setRequired(true)
                )
                .addIntegerOption((option) =>
                    option
                        .setName('newPosition')
                        .setDescription('The new index for the track.')
                        .setRequired(true)
                )
        );
    }
    
    async chatInputRun(interaction) {
        const oldPosition = interaction.options.getInteger('oldPosition');
        const newPosition = interaction.options.getInteger('newPosition');
        const dispatcher = this.container.queue.get(interaction.guildId);
        if (oldPosition < 1 || oldPosition > dispatcher.queue.length) return interaction.reply({ embeds: [this.container.util.embed('error', `Invalid old position (accepts **1** to **${dispatcher.queue.length}**).`)] });
        const track = dispatcher.queue.splice(oldPosition - 1, 1)[0];
        dispatcher.queue.splice(newPosition - 1, 0, track);
        interaction.reply({ embeds: [this.container.util.embed('success', `Moved **${track.info.title}** - **${track.info.author}** from position **${oldPosition}** to position **${newPosition}**.`)] });
    }

    async whatsappRun({ msg, args, dispatcher, sameVoice, voice, discordUser }) {
        if (!discordUser) return await msg.reply('You are not linked to a Discord account. Use ```/link``` to link your WhatsApp account to your Discord account.');
        if (voice === false) return await msg.reply('You are not in a voice channel.');
        if (sameVoice === false) return await msg.reply('You are not in the same voice channel as the bot.');
        if (!dispatcher) return await msg.reply('There is nothing playing.');
        if (!dispatcher.queue.length) return await msg.reply('There are no tracks in the queue.');
        const oldPosition = args[0];
        const newPosition = args[1];
        if (isNaN(Number(oldPosition)) || isNaN(Number(newPosition))) return await msg.reply('Incorrect usage. ```/move <oldPosition> <newPosition>```');
        const old = parseInt(oldPosition);
        if (old < 1 || old > dispatcher.queue.length) return msg.reply(`Invalid old position (accepts *1* to *${dispatcher.queue.length}*).`);
        const track = dispatcher.queue.splice(old - 1, 1)[0];
        dispatcher.queue.splice(newPosition - 1, 0, track);
        await msg.reply(`Moved *${track.info.title}* - *${track.info.author}* from position *${oldPosition}* to position *${newPosition}*.`);
    }
}
