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
    
    async whatsappRun ({ msg, args, author }) {
        const command = args.join(' ').toLowerCase().trim();
        const commands = this.container.stores.get('commands');
        if (command) {
            const cmd = commands.get(command) || commands.find((c) => c.aliases.includes(command));
            if (cmd) {
                await msg.reply(
                    tags.stripIndents`*Command: ${cmd.name}*
                    *Description:* ${cmd.whatsappDescription || cmd.description}
                    *Aliases:* ${cmd.aliases.join(', ')}
                    *Category:* ${cmd.fullCategory.join(' > ')}
                    `
                );
            } else {
                await msg.reply('Command not found.');
            }
        } else {
            await msg.reply(
                tags.stripIndents`*Kana's commands:*
                *Music:* \n\`\`\`${commands.filter((command) => command.fullCategory.includes('music') && command.whatsappRun).map((command) => command.name).join(', ')}\`\`\`
                *Info:* \n\`\`\`${commands.filter((command) => command.fullCategory.includes('info') && command.whatsappRun).map((command) => command.name).join(', ')}\`\`\`
                *Utility:* \n\`\`\`${commands.filter((command) => command.fullCategory.includes('bot') && command.whatsappRun).map((command) => command.name).join(', ')}\`\`\`${this.container.config.ownerIds.includes(author) ? `\n*Owner:* \n\`\`\`${commands.filter((command) => command.fullCategory.includes('owner') && command.whatsappRun).map((command) => command.name).join(', ')}\`\`\`` : ''}
                \nFor more information on a command, type \`\`\`/help <command>\`\`\`.`
            );
        }
    }
}
