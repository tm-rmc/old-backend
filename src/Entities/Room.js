const Gamemode = require('./Gamemode'),
    User = require('./User'),
    DB = require('../Classes/DB');
class Room
{
    /**
     * The online room
     * @param {Room} data Data from SQL
     */
    constructor(data)
    {
        /**
         * The room Id
         * @type {number}
         */
        this.id = data.id;

        /**
         * The room name
         * @type {string}
         */
        this.name = data.name;

        /**
         * The room password (if any)
         * @type {string | null}
         */
        this.password = data.password;

        /**
         * The creator's accountId
         * @type {string}
         */
        this.creatorId = data.creatorId;

        /**
         * The room gamemode id
         * @type {number}
         */
        this.gamemodeId = data.gamemode;

        /**
         * The room's gamemode settings
         * @type {Object}
         */
        this.gamemodeSettings = JSON.parse(data.gamemodeSettings);

        /**
         * The players id in the room
         * @type {Array<string>}
         */
        this.playersId = JSON.parse(data.playersId);
    }

    /**
     * The room gamemode
     * @returns {Promise<Gamemode>}
     */
    async Gamemode()
    {
        return DB.query("SELECT * FROM `gamemodes` WHERE id = ?", this.gamemodeId).then(result => {
            if (result.length > 0){
                return new Gamemode(result[0]);
            } else {
                throw new Error("Gamemode not found");
            }
        });
    }

    /**
     * The room creator
     * @returns {Promise<User>}
     */
    async Creator()
    {
        return DB.query("SELECT * FROM `users` WHERE accountId = ?", this.creatorId).then(result => {
            if (result.length > 0){
                return new User(result[0]);
            } else {
                throw new Error("Creator not found");
            }
        });
    }

    /**
     * The room players
     * @returns {Promise<Array<User>>}
     */
    async Players()
    {
        return DB.query("SELECT * FROM `users` WHERE accountId IN (?)", this.playersId).then(result => {
            return result.map(r=>new User(r));
        });
    }
}

module.exports = Room;