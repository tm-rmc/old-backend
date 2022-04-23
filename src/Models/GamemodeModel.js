const DbContext = require('../DbContext'),
    Gamemode = require('../Entities/Gamemode'),
    DB = require("../Classes/DB");

class GamemodeModel
{
    /**
     * Get all gamemodes
     * @returns {Promise<?Array<Gamemode>>}
     */
    static async getAll()
    {
        return await DbContext.Gamemodes();
    }

    /**
     * Get a gamemode by id
     * @param {number} id The id of the gamemode
     * @returns {Promise<?Gamemode>}
     */
    static async getById(id)
    {
        return DbContext.Gamemodes().then(gamemodes => {
            return gamemodes.find(gamemode => gamemode.id === id);
        });
    }

    /**
     * Create or update a gamemode if already created
     * @param {Gamemode} gamemode
     * @returns {Promise<Gamemode>}
     */
    static async insert(gamemode)
    {
        DB.query("INSERT INTO gamemodes (name, isEnabled, isSponsorOnly) VALUES (?,?,?,?)", [
            gamemode.name,
            gamemode.isEnabled,
            gamemode.isSponsorOnly
        ]).then(()=>{
            return DB.query("SELECT * FROM gamemodes WHERE id = LAST_INSERT_ID()").then(result => {
                return new Gamemode(result[0]);
            });
        });
    }
}

module.exports = GamemodeModel;