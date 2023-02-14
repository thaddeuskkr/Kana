import { Command } from '@sapphire/framework';

export class MaintenanceCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'maintenance',
            description: 'Toggle maintenance mode. Owner only.',
            preconditions: ['owner']
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
        const maintenance = await this.container.client.db.get('maintenance');
        await this.container.client.db.set('maintenance', !maintenance);
        await interaction.reply({ embeds: [this.container.util.embed('success', `${!maintenance ? 'Enabled' : 'Disabled'} maintenance mode.`)] });
    }

    async whatsappRun({ msg, author }) {
        if (!this.container.config.ownerIds.includes(author)) {
            await msg.react('❌');
            return msg.reply('You do not have sufficient permissions to use this command.');
        }
        const maintenance = await this.container.client.db.get('maintenance');
        await this.container.client.db.set('maintenance', !maintenance);
        await msg.reply(`*${!maintenance ? 'Enabled' : 'Disabled'} maintenance mode.*`);
    }
}