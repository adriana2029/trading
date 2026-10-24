// FLYWEIGHT
// Guarda solo el ESTADO INTRÍNSECO (compartido e inmutable) de un activo:
// símbolo, nombre, categoría y decimales.
// El ESTADO EXTRÍNSECO (cantidad, precio promedio, usuario) NO vive aquí:
// lo aportan quienes usan el flyweight (Position, órdenes, historial).

class AssetFlyweight {

    constructor({ symbol, name, category, decimals }) {
        this.symbol = symbol;
        this.name = name;
        this.category = category;
        this.decimals = decimals;
        Object.freeze(this); // inmutable: es seguro compartirlo
    }

    // Operación que recibe el estado extrínseco como parámetro
    formatQuantity(quantity) {
        return Number(quantity).toFixed(this.decimals);
    }

    // Base del símbolo: 'BTC/USD' -> 'BTC'
    get base() {
        return this.symbol.split('/')[0];
    }
}

module.exports = AssetFlyweight;
