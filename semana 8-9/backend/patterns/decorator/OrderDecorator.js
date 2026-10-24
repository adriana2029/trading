// DECORATOR (base)
// Envuelve una orden (BuyOrder/SellOrder u otro decorador) y expone EXACTAMENTE
// la misma interfaz que ella. Cada decorador concreto agrega una
// responsabilidad (límite, stop, protección, comisión) sin tocar las clases
// de orden y pudiendo apilarse en cualquier combinación.

class OrderDecorator {

    constructor(order) {
        this.order = order;
    }

    // --- Datos de la orden envuelta (se delegan) ---
    get type()       { return this.order.type; }
    get status()     { return this.order.status; }
    get user()       { return this.order.user; }
    get asset()      { return this.order.asset; }
    get quantity()   { return this.order.quantity; }
    get price()      { return this.order.price; }
    get stopLoss()   { return this.order.stopLoss; }
    get takeProfit() { return this.order.takeProfit; }
    get date()       { return this.order.date; }

    // --- Operaciones (los decoradores concretos amplían alguna) ---
    execute() {
        return `${this.unwrap().execute()} [${this.getDescripcion()}]`;
    }

    resolve(marketPrice) {
        return this.order.resolve(marketPrice);
    }

    getDescripcion() {
        return this.order.getDescripcion();
    }

    // Devuelve la orden original sin decoradores
    unwrap() {
        return typeof this.order.unwrap === 'function' ? this.order.unwrap() : this.order;
    }

    toJSON() {
        return { ...this.unwrap().toJSON(), descripcion: this.getDescripcion() };
    }
}

module.exports = OrderDecorator;
