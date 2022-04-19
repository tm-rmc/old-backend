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
            delete user.sessionId;
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
     * Get from its sessionId
     * @param {string} sessionId
     */
    static async getFromSessionId(sessionId)
    {
        return DbContext.Users().then(users => {
            return users.find(user => user.sessionId === sessionId);
        });
    }

    /**
     * Create or update a user if already created
     * @param {User} user
     * @returns {Promise<User>}
     */
    static async insertOrUpdate(user)
    {
        DB.query("INSERT INTO users (accountId, displayName, clubTag, isSponsor, groupId, sessionId) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE displayName = ?, clubTag = ?, isSponsor = ?, groupId = ?, sessionId = ?", [
            user.accountId,
            user.displayName,
            user.clubTag,
            user.isSponsor,
            user.groupId,
            user.sessionId,
            user.displayName,
            user.clubTag,
            user.isSponsor,
            user.groupId,
            user.sessionId
        ]).then(()=>{
            return user;
        });
    }
}

module.exports = UserModel;