const DbContext = require('../DbContext'),
    Room = require('../Entities/Room'),
    User = require('../Entities/User'),
    DB = require("../Classes/DB");

class RoomModel
{
    /**
     * Get all rooms
     * @returns {Promise<?Array<Room>>}
     */
    static async getAll()
    {
        return await DbContext.Rooms();
    }

    /**
     * Get all active rooms
     * @returns {Promise<?Array<Room>>}
     */
    static async getAllActive()
    {
        return await DbContext.Rooms().then(rooms => {
            return rooms.filter(room => room.isActive);
        });
    }

    /**
     * Get a room by id
     * @param {number} id The id of the room
     * @returns {Promise<?Room>}
     */
    static async getById(id)
    {
        return DbContext.Rooms().then(rooms => {
            return rooms.find(room => room.id === id);
        });
    }

    /**
     * Get the active room created by a user
     * @param {User} user
     */
    static async getActiveRoomByCreatorId(user)
    {
        return DbContext.Rooms().then(rooms => {
            return rooms.find(room => room.creatorId === user.accountId && room.isActive);
        });
    }

    /**
     * Create a room if already created
     * @param {Room} room
     * @returns {Promise<Room>}
     */
    static async insert(room)
    {
        return DB.query("INSERT INTO rooms (name, password, creatorId, isActive, gamemode, gamemodeSettings, playersId) VALUES (?,?,?,?,?,?,?)", [
            room.name,
            room.password,
            room.creatorId,
            room.isActive,
            room.gamemodeId,
            JSON.stringify(room.gamemodeSettings),
            JSON.stringify(room.playersId)
        ]).then(()=>{
            return DB.query("SELECT * FROM rooms ORDER BY id DESC LIMIT 1").then(result => {
                return new Room(result[0]);
            });
        });
    }

    /**
     * Update a room
     * @param {Room} room
     * @returns {Promise<Room>}
     */
    static async update(room)
    {
        return DB.query("UPDATE rooms SET name = ?, password = ?, creatorId = ?, isActive = ?, gamemode = ?, gamemodeSettings = ?, playersId = ? WHERE id = ?", [
            room.name,
            room.password,
            room.creatorId,
            room.isActive,
            room.gamemodeId,
            JSON.stringify(room.gamemodeSettings),
            JSON.stringify(room.playersId),
            room.id
        ]).then(()=>{
            return DB.query("SELECT * FROM rooms WHERE id = ?", [room.id]).then(result => {
                return new Room(result[0]);
            });
        });
    }
}

module.exports = RoomModel;