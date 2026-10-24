const DatabaseSingleton = require('../patterns/DatabaseSingleton');

// Acceso a datos de saldo, órdenes y cartera (usa la conexión del Singleton).

class TradingRepository {

    constructor() {
        this.db = new DatabaseSingleton().getDatabase();
    }

    transaction(fn) {
        return this.db.transaction(fn)();
    }

    // ---------- Usuario / saldo ----------
    getUser(id) {
        return this.db
            .prepare('SELECT id, name, email, balance FROM users WHERE id = ?')
            .get(id);
    }

    setBalance(id, balance) {
        this.db.prepare('UPDATE users SET balance = ? WHERE id = ?').run(balance, id);
    }

    // ---------- Cartera ----------
    getHoldings(userId) {
        return this.db
            .prepare('SELECT asset, quantity, avg_price FROM holdings WHERE user_id = ? ORDER BY asset')
            .all(userId);
    }

    getHolding(userId, asset) {
        return this.db
            .prepare('SELECT asset, quantity, avg_price FROM holdings WHERE user_id = ? AND asset = ?')
            .get(userId, asset);
    }

    saveHolding(userId, asset, quantity, avgPrice) {
        this.db.prepare(`
            INSERT INTO holdings (user_id, asset, quantity, avg_price) VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, asset) DO UPDATE SET quantity = excluded.quantity,
                                                      avg_price = excluded.avg_price
        `).run(userId, asset, quantity, avgPrice);
    }

    deleteHolding(userId, asset) {
        this.db.prepare('DELETE FROM holdings WHERE user_id = ? AND asset = ?').run(userId, asset);
    }

    // ---------- Órdenes ----------
    insertOrder(o) {
        const r = this.db.prepare(`
            INSERT INTO orders (user_id, asset, side, order_type, quantity, price,
                                execution_price, fee, stop_loss, take_profit,
                                status, notes, created_at, executed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(o.userId, o.asset, o.side, o.orderType, o.quantity, o.price,
               o.executionPrice, o.fee, o.stopLoss, o.takeProfit,
               o.status, o.notes, o.createdAt, o.executedAt);
        return Number(r.lastInsertRowid);
    }

    updateOrder(id, { status, executionPrice, fee, notes, executedAt }) {
        this.db.prepare(`
            UPDATE orders SET status = ?, execution_price = ?, fee = ?, notes = ?, executed_at = ?
            WHERE id = ?
        `).run(status, executionPrice, fee, notes, executedAt, id);
    }

    getOrders(userId) {
        return this.db
            .prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC')
            .all(userId);
    }

    getPendingOrders(userId) {
        return this.db
            .prepare("SELECT * FROM orders WHERE user_id = ? AND status = 'PENDING' ORDER BY id")
            .all(userId);
    }
}

module.exports = TradingRepository;
