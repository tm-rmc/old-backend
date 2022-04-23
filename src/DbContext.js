const DB = require("./Classes/DB"),
    User = require('./Entities/User'),
    Group = require('./Entities/Group'),
    Gamemode = require('./Entities/Gamemode'),
    Room = require('./Entities/Room');

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

    /**
     * The gamemodes
     * @returns {Promise<Array<Gamemode>>}
     */
    static async Gamemodes()
    {
        let arr = [];
        const result = await DB.query("SELECT * FROM `gamemodes`");
        if (result.length > 0) {
            arr = result.map(data => new Gamemode(data));
        }
        return arr;
    }

    /**
     * The rooms
     * @returns {Promise<Array<Room>>}
     */
    static async Rooms()
    {
        let arr = [];
        const result = await DB.query("SELECT * FROM `rooms`");
        if (result.length > 0) {
            arr = result.map(data => new Room(data));
        }
        return arr;
    }
}

module.exports = DatabaseContext;