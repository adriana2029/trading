const OrderFactory = require('../patterns/OrderFactory');
const OrderBuilder = require('../patterns/OrderBuilder');
const BinancePriceAdapter = require('../patterns/adapter/BinancePriceAdapter');
const OrdenCreada = require('../patterns/bridge/OrdenCreada');
const CanalEmail = require('../patterns/bridge/CanalEmail');

class OrderController {

    constructor() {
        // Adapter: fuente de precios de mercado (hoy Binance simulado)
        this.proveedorPrecios = new BinancePriceAdapter();
    }

    createOrder = (req, res) => {

        try {

            const {
                type,
                asset,
                quantity,
                price,
                stopLoss,
                takeProfit
            } = req.body;


            // Comprobar el tipo de orden

            if (!type) {

                return res.status(400).json({
                    message: 'El tipo de orden es obligatorio'
                });

            }


            // Si no llega precio, se consulta el proveedor de mercado
            // a través del Adapter (la app no sabe que por debajo es Binance)

            let precioFinal = price;

            if (!precioFinal) {
                const cotizacion = this.proveedorPrecios.obtenerPrecio(asset || 'BTC/USD');
                precioFinal = cotizacion.precio;
            }


            // Construir los datos de la orden

            const builder = new OrderBuilder();

            const orderData = builder

                .setUser(req.body.user || null)

                .setAsset(asset || 'BTC/USD')

                .setType(type)

                .setQuantity(quantity || 0)

                .setPrice(precioFinal)

                .setStopLoss(stopLoss || 0)

                .setTakeProfit(takeProfit || 0)

                .build();


            // Factory Method crea la orden

            const order = OrderFactory.createOrder(
                type,
                orderData
            );


            // Bridge: se notifica la creación de la orden. El tipo de
            // notificación (OrdenCreada) y el canal (CanalEmail) varían
            // de forma independiente: podría notificarse por CanalPush
            // sin tocar OrdenCreada, o crearse AlertaPrecio sin tocar los canales.

            const notificacion = new OrdenCreada(new CanalEmail());
            notificacion.notificar(order.user, order);


            res.status(201).json({

                message: order.execute(),

                order: order

            });

        } catch (error) {

            res.status(400).json({

                message: error.message

            });

        }

    };

}

module.exports = OrderController;