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
         * The user's club tag (if any)
         * @type {?string}
         */
        this.clubTag = data.clubTag;

        /**
         * is the user Sponsor?
         * @type {boolean}
         */
        this.isSponsor = typeof data.isSponsor === "boolean" ? data.isSponsor : (typeof data.isSponsor === "number" ? data.isSponsor === 1 : false);

        /**
         * The user's Group Id
         * @type {number}
         */
        this.groupId = data.groupId;

        /**
         * The user's session Id
         * @type {string}
         */
        this.sessionId = data.sessionId;
    }

    /**
     * The user's group
     * @returns {Promise<Group>}
     */
    async Group()
    {
        return DB.query("SELECT * FROM `groups` WHERE Id = ?", this.groupId).then(result => {
            if (result.length > 0){
                return new Group(result[0]);
            } else {
                throw new Error("Group not found");
            }
        });
    }
}

module.exports = User;