const User = require('../Entities/User'),
    UserModel = require('../Models/UserModel');

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
        })
    }
}

module.exports = UserController