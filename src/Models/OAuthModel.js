const TMOauthBaseURL = "https://api.trackmania.com/",
    TMOauthTokenURL = TMOauthBaseURL + "api/access_token",
    UserInfoURL = TMOauthBaseURL + "api/user",
    fetch = require('node-fetch');

class OAuthModel
{
    /**
     * @param {string} code
     * @param {string} redirectUri
     * @returns {Promise<tokenObj>}
     */
    static async getAPIToken(code, redirectUri) {
        let bodyForm = new URLSearchParams();
        bodyForm.append("grant_type", "authorization_code");
        bodyForm.append("client_id", process.env.TM_OAUTH_KEY);
        bodyForm.append("client_secret", process.env.TM_OAUTH_SECRET);
        bodyForm.append("code", code);
        bodyForm.append("redirect_uri", redirectUri);

        let resAPI = await fetch(TMOauthTokenURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: bodyForm.toString()
        }),
            resJson = await resAPI.json();

        if (!resAPI.ok) {
            if (resJson) throw resJson.message;
            else throw "Unknown Error from the OAuth API"
        }

        return resJson;
    }

    /**
     * @param {tokenObj} tokenObj
     * @returns {Promise<userInfoAPI>}
     */
    static async getUserInfo(tokenObj) {
        let resAPI = await fetch(UserInfoURL, {
            method: 'GET',
            headers: {
                'Authorization': `${tokenObj.token_type} ${tokenObj.access_token}`
            }
        }),
            resJson = await resAPI.json();

        if (!resAPI.ok) {
            if (resJson) throw resJson.message;
            else throw "Unknown Error from the OAuth API"
        }

        return resJson;
    }
}

module.exports = OAuthModel;


/**
 * @typedef {Object} tokenObj
 * @property {string} access_token
 * @property {Date} expires_in
 * @property {string} refresh_token
 * @property {string} token_type
 */

/**
 * @typedef {Object} userInfoAPI
 * @property {string} accountId
 * @property {string} displayName
 */