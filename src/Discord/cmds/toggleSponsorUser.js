const {Message} = require('discord.js'),
    UserModel = require('../../Models/UserModel');

exports.name = 'toggleSponsor';

/**
 * @param {import('../index')} dcClass
 * @param {Message} message
 * @param {string[]} args
 */
exports.run = async (dcClass, message, args) => {
    if (message.author.id != process.env.DISCORD_OWNER_ID) return;
    if (args.length < 1) return message.reply('Usage: `toggleSponsor <TM accountId or login>`');

    let user = await UserModel.getById(args[0]);
    if (!user) return message.reply('User not found or invalid');

    user.isSponsor = !user.isSponsor;
    await UserModel.insertOrUpdate(user);

    message.reply(`${user.isSponsor ? 'Enabled' : 'Disabled'} sponsor for ${user.displayName}`);
};