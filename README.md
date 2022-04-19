# Random Map Online Services
This is the repository for the Random Map Online Services, used in the MXRandom plugin for Openplanet.

## Plugin authentication flow
When the plugin starts, it makes a request to `/oauth/getUserStatus` with the following query parameters:
- name: The player name
- login: The player login
- webid: The player webid
- sessionid: if already set by the plugin, a authentication session id (that checks if the user is already logged in)
- pluginVersion: The plugin version

If we're not authenticated, the API will send the OAuth URL and its state (random uuid) to the plugin.
else do nothing.

Then the player will opens the authentication URL in browser.

During the process, the plugin will send a request every 10 seconds to `/oauth/pluginSecret` with the following query parameters:
- state

It should returns sessionid, with 2 possible values:
- null: the player is not authenticated
- a string data: the generated session id, the key to identify the player

This session id must be placed in the Authorization header of the next requests with any prefix.