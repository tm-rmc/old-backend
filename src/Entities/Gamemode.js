class Gamemode
{
    /**
     * The gamemode
     * @param {Gamemode} data Data from SQL
     */
    constructor(data)
    {
        /**
         * The gamemode Id
         * @type {number}
         */
        this.id = data.id;

        /**
         * The gamemode name
         * @type {string}
         */
        this.name = data.name;

        /**
         * Whether the gamemode is enabled
         * @type {boolean}
         */
        this.isEnabled = typeof data.isEnabled === "boolean" ? data.isEnabled : (typeof data.isEnabled === "number" ? data.isEnabled === 1 : false);

        /**
         * Whether the gamemode is only for sponsors
         * @type {boolean}
         */
        this.isSponsorOnly = typeof data.isSponsorOnly === "boolean" ? data.isSponsorOnly : (typeof data.isSponsorOnly === "number" ? data.isSponsorOnly === 1 : false);
    }
}

module.exports = Gamemode;