const BuyOrder = require('./patterns/BuyOrder');
const SellOrder = require('./patterns/SellOrder');
const LimitOrderDecorator = require('./patterns/decorator/LimitOrderDecorator');
const StopLossDecorator = require('./patterns/decorator/StopLossDecorator');
const ProteccionDecorator = require('./patterns/decorator/ProteccionDecorator');
const CommissionDecorator = require('./patterns/decorator/CommissionDecorator');
const { check, terminar } = require('./testHelper');

const datos = { user: 'ana', asset: 'BTC/USD', quantity: 2, price: 60000 };

// 1) Orden de mercado "pelada"
const mercado = new BuyOrder(datos);
console.log('Orden base :', mercado.execute(), mercado.resolve(60000));
check('Orden de mercado se ejecuta al precio actual',
    mercado.resolve(60000).status === 'FILLED' && mercado.resolve(60000).executionPrice === 60000);

// 2) Límite de compra a 58000
const limite = new LimitOrderDecorator(new BuyOrder(datos), 58000);
console.log('Límite     :', limite.execute());
check('Límite BUY con mercado 60000 > 58000 queda PENDING', limite.resolve(60000).status === 'PENDING');
check('Límite BUY con mercado 57000 se ejecuta', limite.resolve(57000).status === 'FILLED');

// 3) Stop-loss de venta a 55000
const stop = new StopLossDecorator(new SellOrder({ ...datos }), 55000);
check('Stop SELL con mercado 60000 queda PENDING', stop.resolve(60000).status === 'PENDING');
check('Stop SELL con mercado 54000 se activa', stop.resolve(54000).status === 'FILLED');
try { new StopLossDecorator(new SellOrder(datos), 65000).validarContra(60000); }
catch (e) { console.log('Error esperado:', e.message); check('Stop de venta sobre el mercado se rechaza', true); }

// 4) Apilar decoradores: Límite + Protección + Comisión
const apilada = new CommissionDecorator(
    new ProteccionDecorator(
        new LimitOrderDecorator(new BuyOrder(datos), 61000),
        { stopLoss: 57000, takeProfit: 66000, referencia: 60000 }
    ), 0.001);

const r = apilada.resolve(60000);
console.log('Apilada    :', apilada.execute());
console.log('Resultado  :', r);
check('Los decoradores se apilan y siguen siendo una orden (execute/resolve)',
    typeof apilada.execute() === 'string' && r.status === 'FILLED');
check('Comisión = 2 x 60000 x 0.1% = 120', r.fee === 120);
check('La protección viaja en el resultado', r.protections.stopLoss === 57000 && r.protections.takeProfit === 66000);
check('El decorador expone los datos de la orden envuelta', apilada.quantity === 2 && apilada.type === 'BUY');
check('unwrap() devuelve la orden original', apilada.unwrap() instanceof BuyOrder);

try { new ProteccionDecorator(new BuyOrder(datos), { stopLoss: 62000, referencia: 60000 }); }
catch (e) { console.log('Error esperado:', e.message); check('Stop Loss mayor al precio se rechaza', true); }

terminar();
