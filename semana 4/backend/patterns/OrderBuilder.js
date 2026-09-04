class OrderBuilder {

    constructor() {

        this.order = {};

    }


    setUser(user) {

        this.order.user = user;

        return this;

    }


    setAsset(asset) {

        this.order.asset = asset;

        return this;

    }


    setType(type) {

        this.order.type = type;

        return this;

    }


    setQuantity(quantity) {

        this.order.quantity = quantity;

        return this;

    }


    setPrice(price) {

        this.order.price = price;

        return this;

    }


    setStopLoss(stopLoss) {

        this.order.stopLoss = stopLoss;

        return this;

    }


    setTakeProfit(takeProfit) {

        this.order.takeProfit = takeProfit;

        return this;

    }


    build() {

        this.order.status = 'CREATED';

        this.order.date = new Date().toISOString();

        return this.order;

    }

}


module.exports = OrderBuilder;