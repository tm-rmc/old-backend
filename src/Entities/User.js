const Group = require('./Group'),
    DB = require('../Classes/DB');
class User
{
    /**
     * The user
     * @param {User} data Data from SQL
     */
    constructor(data)
    {
        /**
         * The user's accountId
         * @type {string}
         */
        this.accountId = data.accountId;

        /**
         * The user's display Name
         * @type {string}
         */
        this.displayName = data.displayName;

        /**
         * is the user Sponsor?
         * @type {boolean}
         */
        this.isSponsor = data.isSponsor;

        /**
         * The user's Group Id
         * @type {number}
         */
         this.groupId = data.groupId;

        /**
         * The user's accessToken
         * @type {string}
         */
        this.accessToken = data.accessToken;

        /**
         * The user's token type
         * @type {string}
         */
        this.tokenType = data.tokenType;
    }

    /**
     * The user's group
     * @returns {Promise<Group>}
     */
    async Group()
    {
        return DB.query("SELECT * FROM group WHERE Id = ?", this.groupId).then(result => {
            if (result.length > 0){
                return new Group(result[0]);
            } else {
                throw new Error("Group not found");
            }
        });
    }
}

module.exports = User;