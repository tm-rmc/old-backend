const createError = require('http-errors'),
    UserModel = require('./Models/UserModel'),
    APIInfos = require('./Controllers/API-info'),
    OAuthController = require('./Controllers/OAuthController'),
    UserController = require('./Controllers/UserController'),
    GroupController = require('./Controllers/GroupController'),
    GamemodeController = require('./Controllers/GamemodeController'),
    RoomController = require('./Controllers/RoomController');

module.exports = (app) => {
    app.get('/', APIInfos.getAPIInfo);

    // OAuth
    app.get('/oauth/getUserStatus', OAuthController.getOAuthStatus);
    app.get('/oauth/callback', OAuthController.callbackOAuth);
    // login
    app.get('/oauth/pluginSecret', OAuthController.getSessionId);

    // Groups
    app.get('/groups/allGroups', GroupController.getAllGroups);

    // Gamemodes
    app.get('/gamemodes/all', GamemodeController.getAllGamemodes);

    // -----------------------------------------
    // At this point, the user must be logged in
    app.use(async (req,res,next)=>{
        if (!req.headers.authorization) return next(createError(401, "No authorization header"));
        const sessionId = req.headers.authorization.split(" ")[1],
            authedUser = await UserModel.getFromSessionId(sessionId);

        if (!authedUser) return next(createError(401, "Invalid sessionId"));

        next();
    });

    // User
    app.get('/users/me', UserController.getMe);

    // Rooms
    app.get('/rooms/all', RoomController.getAllRooms);
    app.post('/rooms/create', RoomController.createRoom);
    app.put('/rooms/edit/:id', RoomController.editRoom);
    app.post('/rooms/join/:id', RoomController.joinRoom);
    app.post('/rooms/leave/:id', RoomController.leaveRoom);

    // Logout
    app.post('/oauth/logout', OAuthController.logout);

    // -------------------------------------------
    // At this point, the user must be admin
    app.use(async (req,res,next)=>{
        const sessionId = req.headers.authorization.split(" ")[1],
            authedUser = await UserModel.getFromSessionId(sessionId);

        if (!authedUser) return next(createError(401, "Invalid sessionId"));

        const authedUserGroup = await authedUser.Group();
        if (!authedUserGroup.isAdminGroup) return next(createError(403, "You are not an admin"));

        next();
    });

    // Users
    app.get('/users/allUsers', UserController.getAllUsers);
    app.get('/users/get', UserController.getUser);
    app.put('/users/update', UserController.updateUser);
};