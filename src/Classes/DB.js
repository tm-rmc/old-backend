require('dotenv').config();
const mysql = require('mysql');

class DB {
    /**
     * Connect to the database
     * @returns {Promise<mysql.Connection>}
     */
    static async connect() {
        return new Promise((resolve, reject) => {
            const pool = mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_NAME
            });
            pool.connect((err) => {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(pool);
                }
            });
        });
    }

    /**
     * Execute a query
     * @param {string} sql SQL query
     * @param {string | Array<string>} values Values to be inserted
     * @returns {Promise<mysql.queryCallback>}
     */
    static async query(sql, values) {
        return new Promise((resolve, reject) => {
            DB.connect().then((pool) => {
                pool.query(sql, values, (err, results, fields) => {
                    if (err) {
                        return reject(err);
                    } else {
                        return resolve(results);
                    }
                });
            }).catch((err) => {
                return reject(err);
            });
        });
    }
}

module.exports = DB;