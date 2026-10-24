const AssetFlyweight = require('./AssetFlyweight');
const ASSET_CATALOG = require('./assetCatalog');

// FLYWEIGHT FACTORY
// Entrega SIEMPRE el mismo objeto AssetFlyweight para un mismo símbolo.
// Así, 10.000 posiciones u órdenes de BTC/USD comparten un único objeto.

class AssetFlyweightFactory {

    static pool = new Map();

    static get(symbol) {

        if (AssetFlyweightFactory.pool.has(symbol)) {
            return AssetFlyweightFactory.pool.get(symbol);
        }

        const data = ASSET_CATALOG.find(a => a.symbol === symbol);

        if (!data) {
            throw new Error(`Activo no soportado: ${symbol}`);
        }

        const flyweight = new AssetFlyweight(data);
        AssetFlyweightFactory.pool.set(symbol, flyweight);

        return flyweight;
    }

    // Cuántos flyweights existen realmente en memoria
    static count() {
        return AssetFlyweightFactory.pool.size;
    }

    static list() {
        return ASSET_CATALOG.map(a => AssetFlyweightFactory.get(a.symbol));
    }

    static reset() {
        AssetFlyweightFactory.pool.clear();
    }
}

module.exports = AssetFlyweightFactory;
