const OrderBuilder = require('./patterns/OrderBuilder');

// Construir una orden paso a paso usando el patrón Builder
const order = new OrderBuilder()
    .setUser(1)
    .setAsset('BTC/USD')
    .setType('BUY')
    .setQuantity(0.25)
    .setPrice(64500)
    .setStopLoss(60000)
    .setTakeProfit(70000)
    .build();

console.log('Orden construida con OrderBuilder:');
console.log(order);

console.log('---');

// Construir otra orden distinta reutilizando el mismo builder de forma independiente
const order2 = new OrderBuilder()
    .setUser(2)
    .setAsset('ETH/USD')
    .setType('SELL')
    .setQuantity(3)
    .setPrice(3100)
    .build();

console.log('Segunda orden construida (sin stopLoss/takeProfit):');
console.log(order2);

console.log('---');
console.log('¿El status se asigna automáticamente?', order.status === 'CREATED');
console.log('¿Cada llamada retorna un objeto independiente?', order !== order2);
