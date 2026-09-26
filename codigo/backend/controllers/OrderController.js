const OrderFactory = require('../patterns/OrderFactory');
const OrderBuilder = require('../patterns/OrderBuilder');

class OrderController {

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


            // Construir los datos de la orden

            const builder = new OrderBuilder();

            const orderData = builder

                .setUser(req.body.user || null)

                .setAsset(asset || 'BTC/USD')

                .setType(type)

                .setQuantity(quantity || 0)

                .setPrice(price || 0)

                .setStopLoss(stopLoss || 0)

                .setTakeProfit(takeProfit || 0)

                .build();


            // Factory Method crea la orden

            const order = OrderFactory.createOrder(
                type,
                orderData
            );


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