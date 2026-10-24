const OrderDecorator = require('./OrderDecorator');

// CONCRETE DECORATOR - Orden STOP-LOSS
// SELL: se activa cuando el mercado cae hasta el precio stop (limita pérdidas).
// BUY : se activa cuando el mercado sube hasta el precio stop.
// Mientras no se active, la orden queda PENDING.

class StopLossDecorator extends OrderDecorator {

    constructor(order, stopPrice) {

        super(order);

        if (!(stopPrice > 0)) {
            throw new Error('El precio stop debe ser mayor que 0');
        }

        this.stopPrice = stopPrice;
    }

    // Se invoca al crear la orden: un stop de venta por encima del mercado
    // (o de compra por debajo) se activaría de inmediato, así que se rechaza.
    validarContra(marketPrice) {

        if (this.type === 'SELL' && this.stopPrice >= marketPrice) {
            throw new Error('El stop-loss de venta debe estar por debajo del precio de mercado');
        }

        if (this.type === 'BUY' && this.stopPrice <= marketPrice) {
            throw new Error('El stop de compra debe estar por encima del precio de mercado');
        }
    }

    resolve(marketPrice) {

        const r = super.resolve(marketPrice);

        if (r.status !== 'FILLED') return r;

        const activada = this.type === 'SELL'
            ? marketPrice <= this.stopPrice
            : marketPrice >= this.stopPrice;

        if (!activada) {
            return {
                ...r,
                status: 'PENDING',
                executionPrice: null,
                notes: [...r.notes,
                    `Stop ${this.stopPrice} sin activar (mercado ${marketPrice})`]
            };
        }

        return {
            ...r,
            notes: [...r.notes, `Stop ${this.stopPrice} activado`]
        };
    }

    getDescripcion() {
        return `STOP @${this.stopPrice}`;
    }
}

module.exports = StopLossDecorator;
