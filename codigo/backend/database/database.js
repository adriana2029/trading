const DatabaseSingleton = require('../patterns/DatabaseSingleton');

const databaseSingleton = new DatabaseSingleton();

const db = databaseSingleton.getDatabase();

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    );
`);

console.log('Base de datos preparada correctamente.');