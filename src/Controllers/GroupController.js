const Group = require('../Entities/Group'),
    GroupModel = require('../Models/GroupModel');

class UserController {
    /**
     * GET /group/allGroups
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    static async getAllGroups(req, res, next) {
        GroupModel.getAll().then(groups=>{
            res.json(groups);
        });
    }
}

module.exports = UserController