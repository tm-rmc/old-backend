const createError = require('http-errors'),
    RoomModel = require('../Models/RoomModel'),
    UserModel = require('../Models/UserModel'),
    Room = require('../Entities/Room');

class RoomController {
    /**
     * GET /rooms/all
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    static async getAllRooms(req, res, next) {
        const active = req.query.active === 'true';
        if (active) res.json(await RoomModel.getAllActive());
        else res.json(await RoomModel.getAll());
    }

    /**
     * POST /rooms/create
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    static async createRoom(req, res, next) {

        // Check first if there a active room with the same creator
        const sessionId = req.headers.authorization.split(" ")[1],
            authedUser = await UserModel.getFromSessionId(sessionId),
            creatorId = authedUser.accountId;

        if (await RoomModel.getActiveRoomByCreatorId(authedUser)) return next(createError(400, "You already have an active room"));

        const roomBody = req.body;
        if (!roomBody.gamemode) return next(createError(400, 'Missing gamemode parameter'));

        let name;
        if (!roomBody.name) name = `${authedUser.displayName}'s room`;
        else name = roomBody.name;

        const room = new Room({
            name,
            password: roomBody.password,
            creatorId,
            gamemodeId: roomBody.gamemode,
            gamemodeSettings: roomBody.gamemodeSettings ? roomBody.gamemodeSettings : {},
            isActive: roomBody.isActive ? roomBody.isActive : true,
            playersId: [creatorId]
        });

        res.json(await RoomModel.insert(room));
    }

    /**
     * PUT /rooms/edit/:id
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    static async editRoom(req, res, next) {
        const roomId = req.params.id,
            roomBody = req.body;

        // check if room exists and if the user is the creator
        const sessionId = req.headers.authorization.split(" ")[1],
            authedUser = await UserModel.getFromSessionId(sessionId),
            creatorId = authedUser.accountId,
            room = await RoomModel.getById(roomId);

        if (!room) return next(createError(404, 'Room not found'));
        if (room.creatorId !== creatorId) return next(createError(403, 'You are not the creator of this room'));
        if (room.isActive) return next(createError(400, 'You cannot edit an active room'));

        // update room
        room.name = roomBody.name ? roomBody.name : room.name;
        room.password = roomBody.password ? roomBody.password : room.password;
        room.gamemodeId = roomBody.gamemode ? roomBody.gamemode : room.gamemodeId;
        room.gamemodeSettings = roomBody.gamemodeSettings ? roomBody.gamemodeSettings : room.gamemodeSettings;
        room.isActive = roomBody.isActive ? roomBody.isActive : room.isActive;

        res.json(await RoomModel.update(room));
    }

    /**
     * POST /rooms/join/:id
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    static async joinRoom(req, res, next) {
        const roomId = req.params.id,
            sessionId = req.headers.authorization.split(" ")[1],
            authedUser = await UserModel.getFromSessionId(sessionId);

        // check if room exists and if the user is not already in it
        const room = await RoomModel.getById(roomId);
        if (!room) return next(createError(404, 'Room not found'));
        if (room.playersId.includes(authedUser.accountId)) return next(createError(400, 'You are already in this room'));

        // add user to room
        room.playersId.push(authedUser.accountId);

        res.json(await RoomModel.update(room));
    }

    /**
     * POST /rooms/leave/:id
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    static async leaveRoom(req, res, next) {
        const roomId = req.params.id,
            sessionId = req.headers.authorization.split(" ")[1],
            authedUser = await UserModel.getFromSessionId(sessionId);

        // check if room exists and if the user is in it
        const room = await RoomModel.getById(roomId);
        if (!room) return next(createError(404, 'Room not found'));
        if (!room.playersId.includes(authedUser.accountId)) return next(createError(400, 'You are not in this room'));

        // remove user from room
        room.playersId.splice(room.playersId.indexOf(authedUser.accountId), 1);

        res.json(await RoomModel.update(room));
    }
}

module.exports = RoomController;