const DatabaseSingleton = require('../patterns/DatabaseSingleton');

class User {

    constructor() {
        const databaseSingleton = new DatabaseSingleton();
        this.db = databaseSingleton.getDatabase();
    }

    create(name, email, password) {

        const sql = `
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `;

        const result = this.db.prepare(sql).run(
            name,
            email,
            password
        );

        return result;
    }

    findByEmail(email) {

        const sql = `
            SELECT * FROM users
            WHERE email = ?
        `;

        return this.db.prepare(sql).get(email);
    }
}

module.exports = User;