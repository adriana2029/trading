const OrderDecorator = require('./OrderDecorator');

// CONCRETE DECORATOR - Niveles de protección (Stop Loss / Take Profit)
// Agrega a una COMPRA los niveles de salida y valida que sean coherentes:
//   stopLoss < precio de referencia < takeProfit.
// Un valor 0/vacío significa "sin nivel".

class ProteccionDecorator extends OrderDecorator {

    constructor(order, { stopLoss = 0, takeProfit = 0, referencia }) {

        super(order);

        if (stopLoss && !(stopLoss > 0 && stopLoss < referencia)) {
            throw new Error('El Stop Loss debe ser menor que el precio de la operación');
        }

        if (takeProfit && !(takeProfit > referencia)) {
            throw new Error('El Take Profit debe ser mayor que el precio de la operación');
        }

        this.niveles = { stopLoss: stopLoss || 0, takeProfit: takeProfit || 0 };
    }

    get stopLoss()   { return this.niveles.stopLoss; }
    get takeProfit() { return this.niveles.takeProfit; }

    resolve(marketPrice) {

        const r = super.resolve(marketPrice);

        return {
            ...r,
            protections: { ...r.protections, ...this.niveles },
            notes: [...r.notes,
                `Protección SL=${this.niveles.stopLoss || '-'} TP=${this.niveles.takeProfit || '-'}`]
        };
    }

    getDescripcion() {
        return `${super.getDescripcion()} +SL/TP`;
    }
}

module.exports = ProteccionDecorator;
