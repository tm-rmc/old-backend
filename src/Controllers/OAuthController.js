const createError = require('http-errors'),
    TMOauthBaseURL = "https://api.trackmania.com/",
    TMOauthLoginURL = TMOauthBaseURL + "oauth/authorize?",
    crypto = require('crypto'),
    fs = require('fs'),
    User = require('../Entities/User'),
    UserModel = require('../Models/UserModel'),
    OAuthModel = require('../Models/OAuthModel'),
    { v4: uuid } = require('uuid'),
    {Client} = require('trackmania.io'),
    tmio = new Client(),
    discord = require('../Discord').getDiscordClient();

tmio.setUserAgent('(Greep#3022) RMC Online Services ['+process.env.DEPLOY_MODE || 'dev'+']');

class OAuthController {
    /**
     * GET /oauth/getUserStatus
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    static async getOAuthStatus(req, res, next) {
        try {
            if (!req.query.name) return next(createError(400, "Missing name"));
            if (!req.query.login) return next(createError(400, "Missing login"));
            if (!req.query.webid) return next(createError(400, "Missing webid"));
            // if (tmio.players.toAccountId(req.query.login) != req.query.webid) return next(createError(400, "Invalid webid"));

            // Check if the user is already in the database, firstly by its sessionId, then by its accountId
            let user;
            if (req.query.sessionid) user = await UserModel.getFromSessionId(req.query.sessionid);

            // If the user is not in the database, we send an OAuth url to the user
            // else we send the user's sessionId (the plugin will store it)
            if (!user) {
                let state = 'rmc-' + uuid(),
                    statesJson = {},
                    cacheDir = "./.cache",
                    statesJsonFilePath = cacheDir + "/oauthUserStates.json"

                if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

                if (fs.existsSync(statesJsonFilePath)) statesJson = JSON.parse(fs.readFileSync(statesJsonFilePath));
                statesJson[req.query.webid] = state;
                fs.writeFileSync(statesJsonFilePath, JSON.stringify(statesJson, null, 4));

                let params = new URLSearchParams();
                params.append('response_type', 'code');
                params.append('client_id', process.env.TM_OAUTH_KEY);
                params.append('redirect_uri', encodeURI(req.protocol + '://' + (req.headers["x-forwarded-host"] || req.headers.host) + '/oauth/callback'));
                params.append('state', state);

                if (discord) {
                    discord.logToChannel(`New user ${req.query.name} (\`${req.query.webid}\`) requested OAuth${req.query.pluginVersion ? ` with plugin version ${req.query.pluginVersion}` : ''}`);
                }

                res.json({
                    login: TMOauthLoginURL + params.toString(),
                    state,
                    auth: false
                });
            } else {
                res.json({
                    auth: true
                });
            }
        } catch (err) {
            next(createError(500, err));
        }
    }

    /**
     * GET /oauth/callback
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    static async callbackOAuth(req, res, next) {
        let state = req.query.state,
            cacheDir = "./.cache",
            statesJsonFilePath = cacheDir + "/oauthUserStates.json"

        try {
            if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
            if (!fs.existsSync(statesJsonFilePath)) return next(createError(500, 'Error while checking state: Cache file not found.'));
            let statesJson = JSON.parse(fs.readFileSync(statesJsonFilePath));
            if (!Object.values(statesJson).some(v=>v == state)) res.status(500).send("<h1 style='text-align:center;color:red'>Invalid state, please retry the authentifiation process</h1>");

            let accountId = Object.entries(statesJson).find(o=>o[1] == state)[0];
            if (!accountId) res.status(500).send("<h1 style='text-align:center;color:red'>Invalid state, please retry the authentifiation process</h1>");

            let redirectUri = req.protocol + '://' + (req.headers["x-forwarded-host"] || req.headers.host) + '/oauth/callback',
                tokenObj = await OAuthModel.getAPIToken(req.query.code, redirectUri),
                userDetails = await OAuthModel.getUserInfo(tokenObj),
                tmioPlayer = await tmio.players.get(userDetails.accountId),
                user = await UserModel.getById(userDetails.accountId);

            if (!user) user = new User({
                accountId: userDetails.accountId,
                displayName: userDetails.displayName,
                clubTag: tmioPlayer.clubTag,
                sessionId: crypto.randomBytes(64).toString('hex'),
                isSponsor: false,
                groupId: 3
            });
            else {
                user.displayName = userDetails.displayName;
                user.clubTag = tmioPlayer.clubTag;
                user.sessionId = crypto.randomBytes(64).toString('hex');
            }

            await UserModel.insertOrUpdate(user);

            if (discord) {
                discord.logToChannel(`User ${user.displayName} (\`${user.accountId}\`) has been authenticated with OAuth`);
            }

            res.send("<script>window.close()</script><h1 style='text-align:center'>Success! You can now close this tab.</h1>");
        } catch (err) {
            next(createError(500, err));
        }
    }

    /**
     * GET /oauth/pluginSecret
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    static async getSessionId(req, res, next) {
        if (!req.query.state) return next(createError(400, "Missing state"));
        let state = req.query.state,
            cacheDir = "./.cache",
            statesJsonFilePath = cacheDir + "/oauthUserStates.json"

        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
        if (!fs.existsSync(statesJsonFilePath)) return next(createError(500, 'Error while checking state: Cache file not found.'));
        let statesJson = JSON.parse(fs.readFileSync(statesJsonFilePath));
        if (!Object.values(statesJson).some(v=>v == state)) return next(createError(400, 'Invalid state. (is not in the cache)'));
        let accountId = Object.entries(statesJson).find(o=>o[1] == state)[0];
        if (!accountId) return next(createError(400, 'Invalid state. (not linked to an account)'));
        let user = await UserModel.getById(accountId);
        if (!user) return res.json({
            sessionid: null
        });

        if (discord) {
            discord.logToChannel(`✅ Login by user ${user.displayName} (\`${user.accountId}\`)${req.query.pluginVersion ? ` with plugin version ${req.query.pluginVersion}` : ''}`);
        }
        res.json({
            sessionid: user.sessionId
        });
    }

    /**
     * POST /oauth/logout
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    static async logout(req, res, next) {
        try {
            let sessionid = req.body.sessionid;
            if (!sessionid) return next(createError(400, "Missing sessionid"));
            let user = await UserModel.getFromSessionId(sessionid);
            if (!user) return next(createError(400, "Invalid sessionid"));
            user.sessionId = null;
            await UserModel.insertOrUpdate(user);
            res.json({
                success: true
            });
        } catch (err) {
            next(createError(500, err));
        }
    }
}

module.exports = OAuthController;