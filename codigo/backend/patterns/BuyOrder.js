class BuyOrder {

    constructor(data = {}) {

        this.type = 'BUY';
        this.status = 'CREATED';

        this.user = data.user || null;
        this.asset = data.asset || 'BTC/USD';
        this.quantity = data.quantity || 0;
        this.price = data.price || 0;
        this.stopLoss = data.stopLoss || 0;
        this.takeProfit = data.takeProfit || 0;
        this.date = data.date || new Date().toISOString();

    }

    execute() {

        return 'Orden de COMPRA creada correctamente';

    }

}

module.exports = BuyOrder;