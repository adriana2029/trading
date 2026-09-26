const BinancePriceAdapter = require('./patterns/adapter/BinancePriceAdapter');

const proveedorPrecios = new BinancePriceAdapter();

// Tu app solo conoce obtenerPrecio(activo); no sabe nada de Binance
const precioBTC = proveedorPrecios.obtenerPrecio('BTC/USD');
console.log('Precio actual BTC/USD (vía Adapter):');
console.log(precioBTC);

console.log('---');

const precioETH = proveedorPrecios.obtenerPrecio('ETH/USD');
console.log('Precio actual ETH/USD (vía Adapter):');
console.log(precioETH);

console.log('---');
console.log('¿El Adapter oculta symbol/price de Binance?',
    precioBTC.activo === 'BTC/USD' && precioBTC.precio !== undefined);
