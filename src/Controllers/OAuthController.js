const createError = require('http-errors'),
    TMOauthBaseURL = "https://api.trackmania.com/",
    TMOauthLoginURL = TMOauthBaseURL + "oauth/authorize?",
    crypto = require('crypto'),
    fs = require('fs'),
    User = require('../Entities/User'),
    UserModel = require('../Models/UserModel'),
    OAuthModel = require('../Models/OAuthModel'),
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
        if (!req.query.userlogin) return next(createError(400, "Missing userlogin"));
        try {
            let user = await UserModel.getById(req.query.userlogin);
            if (!user) return res.json({auth:false});
            else {
                tmio.setUserAgent('(Greep#3022) RMC Online Services ['+process.env.DEPLOY_MODE || 'dev'+']');
                let tmioPlayer = await tmio.players.get(user.accountId);

                user.displayName = tmioPlayer.name;
                user.clubTag = tmioPlayer.clubTag;

                await UserModel.insertOrUpdate(user);

                user.auth = user.accessToken !== null || typeof user.accessToken == "string";
                return res.json(user);
            }
        } catch (err) {
            next(createError(500, err));
        }
    }

    /**
     * GET /oauth/login
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    static async loginOAuth(req, res, next) {
        let userLogin = req.query.userlogin;
        if (!userLogin) return next(createError(400, 'Missing userlogin query param'));

        let accountId = tmio.players.toAccountId(userLogin),
            state = crypto.randomBytes(64).toString('hex'),
            statesJson = {},
            cacheDir = "./.cache",
            statesJsonFilePath = cacheDir + "/oauthUserStates.json"

        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

        if (fs.existsSync(statesJsonFilePath)) statesJson = JSON.parse(fs.readFileSync(statesJsonFilePath));
        statesJson[accountId] = state;
        fs.writeFileSync(statesJsonFilePath, JSON.stringify(statesJson, null, 4));

        let params = new URLSearchParams();
        params.append('response_type', 'code');
        params.append('client_id', process.env.TM_OAUTH_KEY);
        params.append('redirect_uri', encodeURI(req.protocol + '://' + (req.headers["x-forwarded-host"] || req.headers.host) + '/oauth/callback'));
        params.append('state', state);

        res.redirect(TMOauthLoginURL + params.toString());
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
                user = await UserModel.getAll().then(uArr=>{
                    return uArr.find(u=>u.accountId == accountId)
                });

            if (!user) user = new User({
                accountId: userDetails.accountId,
                displayName: userDetails.displayName,
                clubTag: null,
                accessToken: tokenObj.access_token,
                tokenType: tokenObj.token_type,
                isSponsor: false,
                groupId: 3
            });
            else {
                user.displayName = userDetails.displayName;
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
}

module.exports = APIInfoController;