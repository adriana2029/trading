const BuyOrder = require('./BuyOrder');
const SellOrder = require('./SellOrder');

class OrderFactory {

    static createOrder(type, data = {}) {

        if (type === 'BUY') {

            return new BuyOrder(data);

        }

        if (type === 'SELL') {

            return new SellOrder(data);

        }

        throw new Error('Tipo de orden no válido');

    }

}

module.exports = OrderFactory;