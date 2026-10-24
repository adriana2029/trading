process.env.DB_PATH = ':memory:';

const TradingFacade = require('./patterns/facade/TradingFacade');
const TradingRepository = require('./models/TradingRepository');
const { check, terminar } = require('./testHelper');
require('./database/database');

// Precios fijos y notificador en memoria para que el resultado sea predecible
const precios = { 'BTC/USD': 60000, 'ETH/USD': 3000 };
const proveedor = { obtenerPrecio: (a) => ({ activo: a, precio: precios[a] }) };
const avisos = [];

const repo = new TradingRepository();
const userId = Number(repo.db
    .prepare("INSERT INTO users (name,email,password) VALUES ('Ana','ana@mail.com','x')").run().lastInsertRowid);

const trading = new TradingFacade({
    repository: repo,
    priceProvider: proveedor,
    notificador: (destino, resumen) => avisos.push({ destino, resumen })
});

// El cliente solo llama a la fachada: una línea por caso de uso
console.log('--- 1) Compra a mercado ---');
const c1 = trading.crearOrden({ userId, type: 'BUY', asset: 'BTC/USD', quantity: 0.1 });
console.log(c1.message);
console.log('Resultado:', c1.resultado.status, '| precio:', c1.resultado.executionPrice, '| comisión:', c1.resultado.fee);
check('Compra a mercado ejecutada', c1.resultado.status === 'FILLED');
check('Saldo = 10000 - 6000 - 0.1% de comisión (6)', trading.obtenerCuenta(userId).saldo === 3994);
check('La Facade disparó la notificación (Bridge)', avisos.length === 1 && avisos[0].destino === 'ana@mail.com');

console.log('--- 2) Compra de ETH ---');
trading.crearOrden({ userId, type: 'BUY', asset: 'ETH/USD', quantity: 1 });

console.log('--- 3) Cartera (Composite) ---');
const cartera = trading.obtenerCartera(userId);
for (const grupo of cartera.hijos) {
    console.log(`[+] ${grupo.nombre}  valor=${grupo.valor}`);
    grupo.hijos.forEach(p => console.log(`     - ${p.nombre} x${p.cantidad}  valor=${p.valor}`));
}
console.log(`TOTAL cartera: ${cartera.valor}`);
check('La cartera tiene 2 posiciones', cartera.posiciones === 2);
check('Valor de la cartera = 6000 + 3000', cartera.valor === 9000);

console.log('--- 4) Orden límite pendiente y luego ejecutada ---');
const saldoAntes = trading.obtenerCuenta(userId).saldo;
const lim = trading.crearOrden({ userId, type: 'BUY', asset: 'BTC/USD', quantity: 0.01,
    orderType: 'LIMIT', price: 55000 });
check('Límite por debajo del mercado queda PENDING', lim.resultado.status === 'PENDING');
check('Pendiente no toca el saldo', trading.obtenerCuenta(userId).saldo === saldoAntes);
precios['BTC/USD'] = 54000;
const cambios = trading.procesarPendientes(userId);
console.log('Pendientes procesadas:', cambios);
check('Al bajar el precio la orden límite se ejecuta', cambios.length === 1 && cambios[0].estado === 'FILLED');

console.log('--- 5) Stop-loss de venta ---');
const st = trading.crearOrden({ userId, type: 'SELL', asset: 'BTC/USD', quantity: 0.1,
    orderType: 'STOP_LOSS', price: 50000 });
check('Stop-loss con mercado por encima queda PENDING', st.resultado.status === 'PENDING');
precios['BTC/USD'] = 49000;
trading.procesarPendientes(userId);
check('Al caer bajo el stop se vende', trading.obtenerHistorial(userId)[0].estado === 'FILLED');

console.log('--- 6) Errores de negocio ---');
for (const caso of [
    { type: 'HOLD', asset: 'BTC/USD', quantity: 1 },
    { type: 'BUY', asset: 'DOGE/USD', quantity: 1 },
    { type: 'BUY', asset: 'BTC/USD', quantity: 100 },
    { type: 'SELL', asset: 'ETH/USD', quantity: 50 },
]) {
    try { trading.crearOrden({ userId, ...caso }); check('debió fallar', false); }
    catch (e) { check(`Rechazo controlado (${caso.type} ${caso.asset} x${caso.quantity}): ${e.message}`, true); }
}

console.log('--- 7) Historial ---');
console.table(trading.obtenerHistorial(userId).map(h =>
    ({ id: h.id, activo: h.activo, tipo: h.tipo, ejecucion: h.ejecucion, cant: h.cantidad, estado: h.estado })));
check('El historial registra las 4 órdenes aceptadas', trading.obtenerHistorial(userId).length === 4);

terminar();
