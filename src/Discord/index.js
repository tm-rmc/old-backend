const Discord = require('./class');
let dcClient;

/**
 * Gets the active Discord client.
 * @returns {Discord | null}
 */
function getDiscordClient() {
    if ('DISCORD_TOKEN' in process.env) {
        if (dcClient) return dcClient;
        dcClient = new Discord();
        return dcClient;
    }
    return null;
}

module.exports = {
    getDiscordClient
}