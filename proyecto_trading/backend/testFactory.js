const OrderFactory = require('./patterns/OrderFactory');

// Crear una orden de COMPRA usando el Factory Method
const buy = OrderFactory.createOrder('BUY', {
    user: 1,
    asset: 'BTC/USD',
    quantity: 0.5,
    price: 65000
});

console.log('Orden creada (BUY):');
console.log(buy);
console.log('Resultado execute():', buy.execute());
console.log('¿Es instancia de BuyOrder?', buy.constructor.name === 'BuyOrder');

console.log('---');

// Crear una orden de VENTA usando el Factory Method
const sell = OrderFactory.createOrder('SELL', {
    user: 1,
    asset: 'ETH/USD',
    quantity: 2,
    price: 3200
});

console.log('Orden creada (SELL):');
console.log(sell);
console.log('Resultado execute():', sell.execute());
console.log('¿Es instancia de SellOrder?', sell.constructor.name === 'SellOrder');

console.log('---');

// Probar tipo inválido
try {
    OrderFactory.createOrder('HOLD', {});
} catch (error) {
    console.log('Error esperado al usar un tipo no válido:', error.message);
}
