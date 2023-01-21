import { Command } from '@sapphire/framework';
import tags from 'common-tags';

export class HelpCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'help',
            description: 'Shows you a list of Kana\'s commands.'
        });
    }

    /*
    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => 
            builder
                .setName(this.name)
                .setDescription(this.description)
        );
    }
    */
    
    async whatsappRun ({ msg, args }) {
        const command = args.join(' ').toLowerCase().trim();
        const commands = this.container.stores.get('commands');
        if (command) {
            // specific command search
        } else {
            await msg.reply(
                tags.stripIndents`*Kana's commands:*
                *Owner:* \`\`\`${commands.filter((command) => command.fullCategory.includes('owner') && command.whatsappRun).map((command) => command.name).join(', ')}\`\`\`
                *Music:* \`\`\`${commands.filter((command) => command.fullCategory.includes('music') && command.whatsappRun).map((command) => command.name).join(', ')}\`\`\`
                *Info:* \`\`\`${commands.filter((command) => command.fullCategory.includes('info') && command.whatsappRun).map((command) => command.name).join(', ')}\`\`\`
                *Bot:* \`\`\`${commands.filter((command) => command.fullCategory.includes('bot') && command.whatsappRun).map((command) => command.name).join(', ')}\`\`\`
                `
            );
        }
    }
}
