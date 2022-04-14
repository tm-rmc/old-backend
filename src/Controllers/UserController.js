const User = require('../Entities/User'),
    UserModel = require('../Models/UserModel'),
    createError = require('http-errors');

class UserController {
    /**
     * GET /users/allUsers
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    static async getAllUsers(req, res, next) {
        UserModel.getAll().then(users=>{
            res.json(users);
        });
    }

    /**
     * GET /users/get
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    static async getUser(req, res, next) {
        let accountId = req.query.id;
        if (!accountId) return next(createError(401, 'missing "id" query string'));
        UserModel.getById(accountId).then(user=>{
            res.json(user);
        }).catch(err=>{
            next(createError(500, err));
        });
    }
}

module.exports = UserController