const BinanceAPI = require('./BinanceAPI');

// TARGET (contrato que tu app espera, documentado aquí como referencia):
//   obtenerPrecio(activo: string) -> { activo, precio, timestamp }
//
// ADAPTER
// Envuelve BinanceAPI (el Adaptee) y expone la interfaz que tu
// OrderController realmente necesita, traduciendo formatos en ambas
// direcciones (activo <-> symbol, price <-> precio).

class BinancePriceAdapter {

    constructor(binanceApi = new BinanceAPI()) {
        this.binanceApi = binanceApi;
    }

    obtenerPrecio(activo) {

        const symbol = this._traducirActivo(activo);

        const ticker = this.binanceApi.getTickerPrice({ symbol });

        return {
            activo: activo,
            precio: ticker.price,
            timestamp: new Date(ticker.time).toISOString()
        };
    }

    // 'BTC/USD' -> 'BTCUSDT' (traduce el formato propio al de Binance)
    _traducirActivo(activo) {
        const [base] = activo.split('/');
        return `${base}USDT`;
    }
}

module.exports = BinancePriceAdapter;
