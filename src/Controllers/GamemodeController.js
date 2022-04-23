const createError = require('http-errors'),
    GamemodeModel = require('../Models/GamemodeModel');

class GamemodeController {
    /**
     * GET /gamemodes/all
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    static async getAllGamemodes(req, res, next) {
        const gamemodes = await GamemodeModel.getAll();
        res.json(gamemodes);
    }
}

module.exports = GamemodeController;