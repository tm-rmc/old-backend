const { Client, Intents } = require('discord.js'),
    client = new Client({
        intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
    });

class Discord {
    constructor() {
        this.client = client;
        this.client.login();

        this.client.on('ready', ()=>{
            this.logToChannel('📡 Logged in as ' + this.client.user.tag);
        });
    }

    logToChannel(message, consoleLog = true) {
        if ('DISCORD_LOG_CHANNEL' in process.env) {
            this.client.channels.fetch(process.env.DISCORD_LOG_CHANNEL).then(channel => {
                if (channel.isText()) channel.send(message);
            });
        }
        if (consoleLog) console.log(`[Discord] ${message}`);
    }

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