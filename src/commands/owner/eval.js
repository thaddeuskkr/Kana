import { Command, container } from '@sapphire/framework';
import { ApplicationCommandType } from 'discord-api-types/v10';
import util from 'util';
import tags from 'common-tags';
import Discord from 'discord.js';

const nl = '!!NL!!';
const nlPattern = new RegExp(nl, 'g');

export class EvalCommand extends Command {
    constructor(context, options) {
        super(context, {
            ...options,
            name: 'eval',
            description: 'Evaluates JavaScript code and returns the result.',
            aliases: ['ev'],
            preconditions: ['owner']
        });
        this.lastResult = null;
        Object.defineProperty(this, '_sensitivePattern', { value: null, configurable: true });
    }

    registerApplicationCommands(registry) {
        registry.registerChatInputCommand((builder) => 
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addStringOption((option) =>
                    option
                        .setName('code')
                        .setDescription('The JavaScript code to evaluate.')
                        .setRequired(true)
                )
        );
        registry.registerContextMenuCommand((builder) => 
            builder
                .setName(this.name)
                .setType(ApplicationCommandType.Message)
                .setDMPermission(false)
        );
    }
    
    async chatInputRun(interaction) {
        const code = interaction.options.getString('code');
        /* eslint-disable no-unused-vars */
        const dispatcher = this.container.queue.get(interaction.guildId);
        const client = this.container.client;
        const whatsappClient = this.container.whatsapp;
        const lastResult = this.lastResult;
        const container = this.container;
        const discord = Discord;
        /* eslint-enable no-unused-vars */
        let hrDiff;
        try {
            const hrStart = process.hrtime();
            this.lastResult = eval(code);
            hrDiff = process.hrtime(hrStart);
        } catch(err) {
            return interaction.reply(`Error while evaluating: \`${err}\``);
        }

        this.hrStart = process.hrtime();
        const result = EvalCommand.makeResultMessages(this.lastResult, hrDiff, code);
        interaction.reply({ content: `*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*` });
        if (Array.isArray(result)) {
            return result.map(item => interaction.channel.send(item));
        } else {
            return interaction.channel.send(result);
        }
    }
    
    async contextMenuRun(interaction) {
        let code = interaction.targetMessage.content;
        if (code.startsWith('```') && code.endsWith('```')) {
            code = code.replace(/(^.*?\s)|(\n.*$)/g, '');
        }
        /* eslint-disable no-unused-vars */
        const client = this.container.client;
        const whatsappClient = this.container.whatsapp;
        const lastResult = this.lastResult;
        const container = this.container;
        const discord = Discord;
        /* eslint-enable no-unused-vars */
        let hrDiff;
        try {
            const hrStart = process.hrtime();
            this.lastResult = eval(code);
            hrDiff = process.hrtime(hrStart);
        } catch(err) {
            return interaction.reply(`Error while evaluating: \`${err}\``);
        }
 
        this.hrStart = process.hrtime();
        const result = EvalCommand.makeResultMessages(this.lastResult, hrDiff, code);
        interaction.reply({ content: `*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*` });
        if (Array.isArray(result)) {
            return result.map(item => interaction.channel.send(item));
        } else {
            return interaction.channel.send(result);
        }
    }
    /* eslint-disable no-unused-vars */
    async whatsappRun({ msg, args, prefix, commandName, user, discordUser, voiceChannels, voice, sameVoice, defaultVc, dispatcher, author }) {
        if (!this.container.config.ownerIds.includes(author)) {
            await msg.react('❌');
            return msg.reply('You do not have sufficient permissions to use this command.');
        }
        const code = args.join(' ').trim();
        const client = this.container.whatsapp;
        const discordClient = this.container.client;
        const message = msg;
        const lastResult = this.lastResult;
        /* eslint-enable no-unused-vars */
        let hrDiff;
        try {
            const hrStart = process.hrtime();
            this.lastResult = eval(code);
            hrDiff = process.hrtime(hrStart);
        } catch (err) {
            return msg.reply(`*Error:*\n\`\`\`${util.inspect(err, { depth: 0 })}\`\`\``);
        }
        msg.reply(`*Executed in ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*\n\`\`\`${util.inspect(this.lastResult, { depth: 0 })}\`\`\``);
    }

    static makeResultMessages(result, hrDiff, input = null) {
        const inspected = util.inspect(result, { depth: 0 })
            .replace(nlPattern, '\n')
            .replace(EvalCommand.sensitivePattern(), '--snip--');
        const split = inspected.split('\n');
        const last = inspected.length - 1;
        const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== '\'' ? split[0] : inspected[0];
        const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== '\'' ?
            split[split.length - 1] :
            inspected[last];
        const prepend = `\`\`\`javascript\n${prependPart}\n`;
        const append = `\n${appendPart}\n\`\`\``;
        if (input) {
            return EvalCommand.splitMessage(tags.stripIndents`
            \`\`\`javascript
            ${inspected}
            \`\`\`
        `, { maxLength: 1900, prepend, append });
        } else {
            return EvalCommand.splitMessage(tags.stripIndents`
				*Callback executed after ${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.*
				\`\`\`javascript
				${inspected}
				\`\`\`
			`, { maxLength: 1900, prepend, append });
        }
    }

    static splitMessage(text, { maxLength = 2000, char = '\n', prepend = '', append = '' } = {}) {
        text = EvalCommand.verifyString(text);
        if (text.length <= maxLength) return [text];
        let splitText = [text];
        if (Array.isArray(char)) {
            while (char.length > 0 && splitText.some(elem => elem.length > maxLength)) {
                const currentChar = char.shift();
                if (currentChar instanceof RegExp) {
                    splitText = splitText.flatMap(chunk => chunk.match(currentChar));
                } else {
                    splitText = splitText.flatMap(chunk => chunk.split(currentChar));
                }
            }
        } else {
            splitText = text.split(char);
        }
        if (splitText.some(elem => elem.length > maxLength)) throw new RangeError('SPLIT_MAX_LEN');
        const messages = [];
        let msg = '';
        for (const chunk of splitText) {
            if (msg && (msg + char + chunk + append).length > maxLength) {
                messages.push(msg + append);
                msg = prepend;
            }
            msg += (msg && msg !== prepend ? char : '') + chunk;
        }
        return messages.concat(msg).filter(m => m);
    }

    static verifyString(
        data,
        error = Error,
        errorMessage = `Expected a string, got ${data} instead.`,
        allowEmpty = true,
    ) {
        if (typeof data !== 'string') throw new error(errorMessage);
        if (!allowEmpty && data.length === 0) throw new error(errorMessage);
        return data;
    }
    
    static escapeRegex(str) {
        return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
    }

    static sensitivePattern() {
        if (!this._sensitivePattern) {
            const client = container.client;
            let pattern = '';
            if (client.token) pattern += EvalCommand.escapeRegex(client.token);
            Object.defineProperty(this, '_sensitivePattern', { value: new RegExp(pattern, 'gi'), configurable: false });
        }
        return this._sensitivePattern;
    }
}
