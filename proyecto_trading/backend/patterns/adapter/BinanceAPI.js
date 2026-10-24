// ADAPTEE
// Esta clase simula una librería/API externa (ej. Binance).
// Nota cómo su interfaz NO se parece en nada a lo que tu app espera:
// - Usa símbolos tipo "BTCUSDT" en vez de "BTC/USD"
// - El método se llama getTickerPrice(), no obtenerPrecio()
// - Devuelve { symbol, price, time } en vez de { activo, precio, timestamp }
//
// En un proyecto real, este archivo sería reemplazado por el SDK oficial
// del proveedor (ej. node-binance-api) y tú NO podrías modificarlo.

class BinanceAPI {

    getTickerPrice({ symbol }) {

        // Simulación de precios de mercado (sin llamada de red real)
        const preciosBase = {
            'BTCUSDT': 64500,
            'ETHUSDT': 3100,
            'SOLUSDT': 145,
            'UNIUSDT': 7.5,
            'LINKUSDT': 15,
            'PUNKUSDT': 42000
        };

        const base = preciosBase[symbol] ?? 100;

        // pequeña variación aleatoria para simular movimiento de mercado
        const variacion = (Math.random() - 0.5) * base * 0.01;
        const price = Number((base + variacion).toFixed(2));

        return {
            symbol,
            price,
            time: Date.now()
        };
    }
}

module.exports = BinanceAPI;
