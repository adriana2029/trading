const OrderDecorator = require('./OrderDecorator');

// CONCRETE DECORATOR - Comisión de la plataforma
// Cobra un porcentaje del valor operado cuando la orden se ejecuta.

class CommissionDecorator extends OrderDecorator {

    constructor(order, rate = 0.001) {
        super(order);
        this.rate = rate;
    }

    resolve(marketPrice) {

        const r = super.resolve(marketPrice);

        if (r.status !== 'FILLED') return r;

        const comision = this.quantity * r.executionPrice * this.rate;

        return {
            ...r,
            fee: Number((r.fee + comision).toFixed(6)),
            notes: [...r.notes, `Comisión ${(this.rate * 100).toFixed(2)}%`]
        };
    }

    getDescripcion() {
        return `${super.getDescripcion()} +FEE`;
    }
}

module.exports = CommissionDecorator;
