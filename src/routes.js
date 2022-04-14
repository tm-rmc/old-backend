const createError = require('http-errors'),
    UserModel = require('./Models/UserModel'),
    APIInfos = require('./Controllers/API-info'),
    OAuthController = require('./Controllers/OAuthController'),
    UserController = require('./Controllers/UserController'),
    GroupController = require('./Controllers/GroupController');

module.exports = (app) => {
    app.get('/', APIInfos.getAPIInfo);

    // OAuth
    app.get('/oauth/getUserStatus', OAuthController.getOAuthStatus);
    app.get('/oauth/login', OAuthController.loginOAuth);
    app.get('/oauth/callback', OAuthController.callbackOAuth);

    // At this point, the user must be logged in
    app.use((req,res,next)=>{
        if (!req.headers.authorization) return next(createError(401, "No authorization header"));
        const token = req.headers.authorization.split(" ")[1],
            authedUser = UserModel.getFromToken(token);

        if (!authedUser) throw createError(401, "Invalid token");

        next();
    });

    // Groups
    app.get('/groups/allGroups', GroupController.getAllGroups);

    // At this point, the user must be an admin
    app.use((req,res,next)=>{
        const token = req.headers.authorization.split(" ")[1],
            authedUser = UserModel.getFromToken(token);

        if (!authedUser) throw createError(401, "Invalid token");

        const authedUserGroup = authedUser.Group();
        if (!authedUserGroup.isAdminGroup) throw createError(403, "You are not an admin");

        next();
    });

    // Users
    app.get('/users/allUsers', UserController.getAllUsers);
    app.get('/users/get', UserController.getUser);
};