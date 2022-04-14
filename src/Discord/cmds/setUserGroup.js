const {Message} = require('discord.js'),
    UserModel = require('../../Models/UserModel'),
    GroupModel = require('../../Models/GroupModel');

exports.name = 'setGroup';

/**
 * @param {import('../index')} dcClass
 * @param {Message} message
 * @param {string[]} args
 */
exports.run = async (dcClass, message, args) => {
    if (message.author.id != process.env.DISCORD_OWNER_ID) return;
    let groups = await GroupModel.getAll();
    if (args.length < 1) return message.reply('Usage: `setGroup <TM accountId or login> <groupId>`\nGroups: ```' + groups.map(g=>`${g.Id} - ${g.name}`).join('\n') + '```');

    let user = await UserModel.getById(args[0]);
    if (!user) return message.reply('User not found or invalid');

    let selectedGroup = groups.find(g=>g.Id == args[1]);
    if (!selectedGroup) return message.reply('Group not found or invalid');

    user.groupId = selectedGroup.Id;
    await UserModel.insertOrUpdate(user);

    message.reply(`${user.displayName} has been moved to group "${selectedGroup.name}"`);
};