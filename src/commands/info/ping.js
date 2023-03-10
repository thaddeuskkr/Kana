import { Command } from '@sapphire/framework';

export class PingCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'ping',
            description: 'Checks Kana\'s heartbeat ping and message round trip time.'
        });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => 
            builder
                .setName(this.name)
                .setDescription(this.description)
        );
    }
    
    async chatInputRun(interaction) {
        const msg = await interaction.reply({ content: '*Pong!*', fetchReply: true });
        interaction.editReply({ content: `*Pong!*\n**Heartbeat:** \`${Math.round(this.container.client.ws.ping)}ms\`\n**Message round trip time:** \`${Math.round(msg.createdTimestamp - interaction.createdTimestamp)}ms\`` });
    }

    async whatsappRun({ msg }) {
        /*
        I'm aware that this command only gets Discord's WebSocket ping. But I'm not too sure on how to get WhatsApp's ping.
        */
        msg.reply(`*Pong!* \n*Heartbeat:* ${Math.round(this.container.client.ws.ping)}ms`);
    }
}
