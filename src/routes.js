const APIInfos = require('./Controllers/API-info');

module.exports = (app) => {
    app.get('/', APIInfos.getAPIInfo);
};