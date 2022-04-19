const { Client, Intents } = require('discord.js'),
    client = new Client({
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
    }),
    fs = require('fs');

class Discord {
    constructor() {
        this.client = client;
        this.client.login();

        this.commandFiles = [];

        this.client.on('ready', ()=>{
            console.log('📡 Logged in as ' + this.client.user.tag);
            fs.readdirSync('./src/Discord/cmds').forEach(file => {
                if (file.endsWith('.js')) {
                    let commandFile = require(`./cmds/${file}`);
                    this.commandFiles.push(commandFile);
                }
            });
        });

        this.client.on('messageCreate', message=>{
            if (message.author.bot) return;
            if (!message.content.startsWith(`<@${this.client.user.id}>`)) return;
            // remove the mention + space
            let command = message.content.substring(`<@${this.client.user.id}> `.length),
                args = command.split(' ');
            command = args.shift();

            if (command.length == 0) return message.reply('All '+this.commandFiles.length+' commands: ```\n' + this.commandFiles.map(c=>c.name).join('\n') + '```');

            if (this.commandFiles.some(c=>c.name == command)) {
                this.commandFiles.find(c=>c.name == command).run(this, message, args);
            }
        });
    }

    /**
     * Logs defined messages to main log channel
     * @param {string} message
     * @param {boolean} [consoleLog=true]
     */
    logToChannel(message, consoleLog = true) {
        if ('DISCORD_LOG_CHANNEL' in process.env) {
            this.client.channels.fetch(process.env.DISCORD_LOG_CHANNEL).then(channel => {
                if (channel.isText()) channel.send(message);
            });
        }
        if (consoleLog) console.log(`[Discord] ${message}`);
    }

    /**
     * Logs requests (express)
     * @private
     */
    loggerToDiscord(o) {
        var dc = this,
            optionsCallback = null;
        if (typeof o === 'function') {
            optionsCallback = o;
        } else {
            optionsCallback = function (req, cb) {
                cb(null, o);
            };
        }
        /**
         * @param {import('express').Request} req
         * @param {import('express').Response} res
         * @param {import('express').NextFunction} next
         */
        return function(req,res,next) {
            optionsCallback(req, function(err, options) {
                if ('DISCORD_REQ_LOG_CHANNEL' in process.env) {
                    dc.client.channels.fetch(process.env.DISCORD_REQ_LOG_CHANNEL).then(channel => {
                        if (!channel) return next();
                        if (channel.isText()) channel.send(`${res.statusCode == 200 ? '✅' : '❌'} ${req.ip} - ${req.method} "${req.originalUrl}" ${res.statusCode} ${res.statusCode == 200 ? `- ${res.getHeader('Content-Length')} ` : ''}- "${req.headers["user-agent"]}"`);
                    });
                }
                next();
            });
        }
    }
}

module.exports = Discord;