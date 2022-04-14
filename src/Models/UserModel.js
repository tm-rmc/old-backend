const { use } = require('express/lib/application');

const DbContext = require('../DbContext'),
    User = require('../Entities/User'),
    DB = require("../Classes/DB"),
    {Client} = require('trackmania.io'),
    tmio = new Client();

class UserModel
{
    /**
     * Get all users (without passwords and salts)
     * @returns {Promise<?Array<User>>}
     */
    static async getAll()
    {
        const users = await DbContext.Users();
        const usersWithoutCode = [];
        users.forEach(user => {
            delete user.accessToken;
            delete user.tokenType;
            usersWithoutCode.push(user);
        });
        return usersWithoutCode;
    }

    /**
     * Get a user by account id
     * @param {string} accountId The account id or the login of the user
     * @returns {Promise<?User>}
     */
    static async getById(accountId)
    {
        if (accountId.length == 22) accountId = tmio.players.toAccountId(accountId);
        if (accountId.length != 36) throw "Invalid account ID";
        return DbContext.Users().then(users => {
            return users.find(user => user.accountId === accountId);
        });
    }

    /**
     * Create or update a user if already created
     * @param {User} user
     * @returns {Promise<User>}
     */
    static async insertOrUpdate(user)
    {
        DB.query("INSERT INTO users (accountId, displayName, isSponsor, groupId, accessToken, tokenType) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE displayName = ?, isSponsor = ?, groupId = ?, accessToken = ?, tokenType = ?", [
            user.accountId,
            user.displayName,
            user.isSponsor,
            user.groupId,
            user.accessToken,
            user.tokenType,
            user.displayName,
            user.isSponsor,
            user.groupId,
            user.accessToken,
            user.tokenType
        ]).then(()=>{
            return user;
        });
    }
}

module.exports = UserModel;