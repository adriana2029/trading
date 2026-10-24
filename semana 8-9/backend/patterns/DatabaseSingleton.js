const Database = require('better-sqlite3');
const path = require('path');

class DatabaseSingleton {

    constructor() {

        if (DatabaseSingleton.instance) {
            return DatabaseSingleton.instance;
        }

        this.database = new Database(
            process.env.DB_PATH || path.join(__dirname, '..', 'database', 'trading.db')
        );

        DatabaseSingleton.instance = this;
    }

    getDatabase() {
        return this.database;
    }
}

module.exports = DatabaseSingleton;