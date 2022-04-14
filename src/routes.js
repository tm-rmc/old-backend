const APIInfos = require('./Controllers/API-info'),
    OAuthController = require('./Controllers/OAuthController'),
    UserController = require('./Controllers/UserController');

module.exports = (app) => {
    app.get('/', APIInfos.getAPIInfo);

    // OAuth
    app.get('/oauth/getUserStatus', OAuthController.getOAuthStatus);
    app.get('/oauth/login', OAuthController.loginOAuth);
    app.get('/oauth/callback', OAuthController.callbackOAuth);

    // Users
    app.get('/users/allUsers', UserController.getAllUsers);
};