const Database = require('better-sqlite3');

class DatabaseSingleton {

    constructor() {

        if (DatabaseSingleton.instance) {
            return DatabaseSingleton.instance;
        }

        this.database = new Database('./database/trading.db');

        DatabaseSingleton.instance = this;
    }

    getDatabase() {
        return this.database;
    }
}

module.exports = DatabaseSingleton;