const OrdenCreada = require('./patterns/bridge/OrdenCreada');
const AlertaPrecio = require('./patterns/bridge/AlertaPrecio');
const CanalEmail = require('./patterns/bridge/CanalEmail');
const CanalPush = require('./patterns/bridge/CanalPush');

const ordenEjemplo = {
    type: 'BUY',
    asset: 'BTC/USD',
    quantity: 0.25,
    price: 64500
};

console.log('--- OrdenCreada por Email ---');
new OrdenCreada(new CanalEmail()).notificar('usuario1@correo.com', ordenEjemplo);

console.log('--- La MISMA notificación (OrdenCreada) por Push ---');
new OrdenCreada(new CanalPush()).notificar('usuario1', ordenEjemplo);

console.log('--- Un tipo DISTINTO de notificación (AlertaPrecio) por Email ---');
new AlertaPrecio(new CanalEmail()).notificar('usuario1@correo.com', {
    activo: 'ETH/USD',
    precio: 3200,
    umbral: 3000
});

console.log('---');
console.log('Con herencia pura, cada combinación tipo x canal sería una clase (2 x 2 = 4; con 3 x 3 serían 9).');
console.log('Con Bridge las dos jerarquías crecen por separado (2 + 2 = 4; con 3 y 3 serían solo 6).');
