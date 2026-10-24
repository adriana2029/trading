const DatabaseSingleton = require('../patterns/DatabaseSingleton');

const databaseSingleton = new DatabaseSingleton();

const db = databaseSingleton.getDatabase();

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        balance REAL NOT NULL DEFAULT 10000
    );

    CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        asset TEXT NOT NULL,
        side TEXT NOT NULL,
        order_type TEXT NOT NULL DEFAULT 'MARKET',
        quantity REAL NOT NULL,
        price REAL,
        execution_price REAL,
        fee REAL NOT NULL DEFAULT 0,
        stop_loss REAL NOT NULL DEFAULT 0,
        take_profit REAL NOT NULL DEFAULT 0,
        status TEXT NOT NULL,
        notes TEXT,
        created_at TEXT NOT NULL,
        executed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS holdings (
        user_id INTEGER NOT NULL,
        asset TEXT NOT NULL,
        quantity REAL NOT NULL,
        avg_price REAL NOT NULL,
        PRIMARY KEY (user_id, asset)
    );
`);

// Migración: bases creadas en semanas anteriores no tienen la columna balance
const columnas = db.prepare('PRAGMA table_info(users)').all();

if (!columnas.some(c => c.name === 'balance')) {
    db.exec('ALTER TABLE users ADD COLUMN balance REAL NOT NULL DEFAULT 10000');
}

console.log('Base de datos preparada correctamente.');
