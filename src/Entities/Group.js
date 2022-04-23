const User = require('./User'),
    DB = require('../Classes/DB');
class Group
{
    /**
     * The user
     * @param {User} data Data from SQL
     */
    constructor(data)
    {
        /**
         * The group's Id
         * @type {number}
         */
        this.Id = data.Id;

        /**
         * The group's name
         * @type {string}
         */
        this.name = data.name;

        /**
         * is a administartive group?
         * @type {boolean}
         */
        this.isAdminGroup = typeof data.isAdminGroup === "boolean" ? data.isAdminGroup : (typeof data.isAdminGroup === "number" ? data.isAdminGroup === 1 : false);
    }

    /**
     * The users in the group
     * @returns {Promise<Array<User>>}
     */
    async Users()
    {
        return DB.query("SELECT * FROM `users` WHERE groupId = ?", this.Id).then(result => {
            return result.map(r=>new User(r));
        });
    }
}

module.exports = Group;