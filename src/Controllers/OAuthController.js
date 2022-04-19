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
    tmio = new Client();

class APIInfoController {
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
            if (tmio.players.toLogin(req.query.webid) != req.query.login) return next(createError(400, "Invalid webid"));
            let user = await UserModel.getById(req.query.webid);
            if (!req.query.sessionId || !user) {
                let state = crypto.randomBytes(64).toString('hex'),
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

                res.json({
                    login: TMOauthLoginURL + params.toString(),
                    state,
                    auth: false
                });
            } else {
                res.json({auth: true});
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

            tmio.setUserAgent('(Greep#3022) RMC Online Services ['+process.env.DEPLOY_MODE || 'dev'+']');

            let redirectUri = req.protocol + '://' + (req.headers["x-forwarded-host"] || req.headers.host) + '/oauth/callback',
                tokenObj = await OAuthModel.getAPIToken(req.query.code, redirectUri),
                userDetails = await OAuthModel.getUserInfo(tokenObj),
                tmioPlayer = await tmio.players.get(userDetails.accountId),
                user = await UserModel.getById(userDetails.accountId);

            if (!user) user = new User({
                accountId: userDetails.accountId,
                displayName: userDetails.displayName,
                clubTag: tmioPlayer.clubTag,
                sessionId: uuid(),
                accessToken: tokenObj.access_token,
                tokenType: tokenObj.token_type,
                isSponsor: false,
                groupId: 3
            });
            else {
                user.displayName = userDetails.displayName;
                user.clubTag = tmioPlayer.clubTag;
                user.accessToken = tokenObj.access_token;
                user.tokenType = tokenObj.token_type;
            }

            await UserModel.insertOrUpdate(user);

            delete statesJson[user.accountId];
            fs.writeFileSync(statesJsonFilePath, JSON.stringify(statesJson, null, 4));

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
    static async getOAuthToken(req, res, next) {
        if (!req.query.sessionid) return next(createError(400, "Missing sessionid"));
        let user = await UserModel.getFromSessionId(req.query.sessionid);
        if (!user) return next(createError(400, "Invalid sessionid"));
        res.json({
            access_token: user.accessToken,
            token_type: user.tokenType
        });
    }
}

module.exports = APIInfoController;