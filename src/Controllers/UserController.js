const User = require('../Entities/User'),
    UserModel = require('../Models/UserModel'),
    createError = require('http-errors');

class UserController {

    /**
     * GET /users/me
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    static async getMe(req, res, next) {
        const sessionId = req.headers.authorization.split(" ")[1],
            authedUser = await UserModel.getFromSessionId(sessionId);

        if (!authedUser) return next(createError(401, "Invalid sessionId"));

        delete authedUser["sessionId"];
        res.json(authedUser);
    }

    /**
     * GET /users/allUsers
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    static async getAllUsers(req, res, next) {
        UserModel.getAll().then(users=>{
            res.json(users.map(user=>{
                delete user["sessionId"];
                return user;
            }));
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
            if (!user) return next(createError(404, 'user not found'));
            delete user["sessionId"];
            res.json(user);
        }).catch(err=>{
            next(createError(500, err));
        });
    }

    /**
     * PUT /users/update
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    static async updateUser(req, res, next) {
        let accountId = req.body.id;
        if (!accountId) return next(createError(401, 'missing "id" body string'));
        UserModel.getById(accountId).then(user=>{
            if (!user) return next(createError(404, 'user not found'));

            if (req.body.groupId && typeof req.body.groupId == "number") user.groupId = req.body.groupId;
            if (req.body.isSponsor && typeof req.body.isSponsor == "boolean") user.isSponsor = req.body.isSponsor;

            UserModel.insertOrUpdate(user).then(()=>{
                delete user["sessionId"];
                res.json(user);
            }).catch(err=>{
                next(createError(500, err));
            });
        }).catch(err=>{
            next(createError(500, err));
        });
    }
}

module.exports = UserController