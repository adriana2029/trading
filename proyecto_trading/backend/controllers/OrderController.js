const TradingFacade = require('../patterns/facade/TradingFacade');

// El controlador ahora solo traduce HTTP <-> Facade. Toda la orquestación
// (precios, Builder, Factory, Decorators, riesgo, persistencia, notificación)
// vive detrás de TradingFacade.

class OrderController {

    constructor(facade = new TradingFacade()) {
        this.trading = facade;
    }

    createOrder = (req, res) => {

        try {

            const { userId, type, asset, quantity, price, stopLoss, takeProfit, orderType } = req.body;

            if (!type) {
                return res.status(400).json({ message: 'El tipo de orden es obligatorio' });
            }

            const r = this.trading.crearOrden({
                userId: Number(userId), type, asset, quantity, price,
                stopLoss, takeProfit, orderType
            });

            res.status(201).json({
                message: r.message,
                order: r.order,
                result: r.resultado,
                market: r.mercado
            });

        } catch (error) {

            res.status(400).json({ message: error.message });

        }

    };

    history = (req, res) => this._responder(res, () =>
        this.trading.obtenerHistorial(Number(req.query.userId)));

    portfolio = (req, res) => this._responder(res, () =>
        this.trading.obtenerCartera(Number(req.query.userId)));

    account = (req, res) => this._responder(res, () =>
        this.trading.obtenerCuenta(Number(req.query.userId)));

    processPending = (req, res) => this._responder(res, () =>
        this.trading.procesarPendientes(Number(req.body.userId)));

    price = (req, res) => this._responder(res, () =>
        this.trading.obtenerPrecio(req.query.asset || 'BTC/USD'));

    assets = (req, res) => this._responder(res, () => this.trading.listarActivos());

    _responder(res, fn) {
        try {
            res.status(200).json(fn());
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = OrderController;
