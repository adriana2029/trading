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
console.log('Con herencia pura, cada combinación tipo x canal sería una clase.');
console.log('Con Bridge, 2 tipos x 2 canales = 4 clases en total (no 4 combinadas).');
