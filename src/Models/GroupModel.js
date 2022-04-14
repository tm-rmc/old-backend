const DbContext = require('../DbContext'),
    Group = require('../Entities/Group'),
    DB = require("../Classes/DB"),
    {Client} = require('trackmania.io'),
    tmio = new Client();

class GroupModel
{
    /**
     * Get all groups
     * @returns {Promise<?Array<Group>>}
     */
    static async getAll()
    {
        return await DbContext.Groups();
    }

    /**
     * Get a group by account id
     * @param {number} accountId The account id or the login of the group
     * @returns {Promise<?Group>}
     */
    static async getById(id)
    {
        return DbContext.Groups().then(groups => {
            return groups.find(group => group.Id === id);
        });
    }

    /**
     * Create or update a group if already created
     * @param {Group} group
     * @returns {Promise<Group>}
     */
    static async insertOrUpdate(group)
    {
        DB.query("INSERT INTO groups (Id, name, isAdminGroup) VALUES (?,?,?) ON DUPLICATE KEY UPDATE name = ?, isAdminGroup = ?", [
            group.Id,
            group.name,
            group.isAdminGroup,
            group.name,
            group.isAdminGroup
        ]).then(()=>{
            return group;
        });
    }
}

module.exports = GroupModel;