const createError = require('http-errors');

class APIInfoController {
    /**
     * GET /
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    static async getAPIInfo(req, res, next) {
        const pkg = require('../../package.json');
        res.json({
            name: pkg.name,
            deployMode: process.env.DEPLOY_MODE || 'dev',
            version: pkg.version,
            description: pkg.description,
            dependencies: pkg.dependencies,
            ["user-agent"]: req.headers["user-agent"],
            host: req.headers["x-forwarded-host"] || req.headers.host,
        });
    }
}

module.exports = APIInfoController;