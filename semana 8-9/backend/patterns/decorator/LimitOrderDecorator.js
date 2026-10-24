const OrderDecorator = require('./OrderDecorator');

// CONCRETE DECORATOR - Orden LÍMITE
// BUY: solo se ejecuta si el mercado está en el límite o por debajo.
// SELL: solo se ejecuta si el mercado está en el límite o por encima.
// Si no se cumple, la orden queda PENDING.

class LimitOrderDecorator extends OrderDecorator {

    constructor(order, limitPrice) {

        super(order);

        if (!(limitPrice > 0)) {
            throw new Error('El precio límite debe ser mayor que 0');
        }

        this.limitPrice = limitPrice;
    }

    resolve(marketPrice) {

        const r = super.resolve(marketPrice);

        if (r.status !== 'FILLED') return r;

        const cumple = this.type === 'BUY'
            ? marketPrice <= this.limitPrice
            : marketPrice >= this.limitPrice;

        if (!cumple) {
            return {
                ...r,
                status: 'PENDING',
                executionPrice: null,
                notes: [...r.notes,
                    `Límite ${this.limitPrice} no alcanzado (mercado ${marketPrice})`]
            };
        }

        return {
            ...r,
            notes: [...r.notes, `Límite ${this.limitPrice} alcanzado`]
        };
    }

    getDescripcion() {
        return `LIMIT @${this.limitPrice}`;
    }
}

module.exports = LimitOrderDecorator;
