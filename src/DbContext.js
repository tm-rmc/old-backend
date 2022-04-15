const DB = require("./Classes/DB"),
    User = require('./Entities/User'),
    Group = require('./Entities/Group');

class DatabaseContext
{
    /**
     * The users
     * @returns {Promise<Array<User>>}
     */
    static async Users()
    {
        let arr = [];
        const result = await DB.query("SELECT * FROM `users`");
        if (result.length > 0) {
            arr = result.map(data => new User(data));
        }
        return arr;
    }

    /**
     * The groups
     * @returns {Promise<Array<Group>>}
     */
    static async Groups()
    {
        let arr = [];
        const result = await DB.query("SELECT * FROM `groups`");
        if (result.length > 0) {
            arr = result.map(data => new Group(data));
        }
        return arr;
    }
}

module.exports = DatabaseContext;