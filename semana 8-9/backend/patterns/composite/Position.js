const PortfolioComponent = require('./PortfolioComponent');

// LEAF
// Una posición: cuánto tiene el usuario de UN activo.
// 'asset' es un Flyweight compartido; cantidad y precio promedio son
// el estado extrínseco propio de cada posición.

class Position extends PortfolioComponent {

    constructor(asset, quantity, avgPrice) {
        super();
        this.asset = asset;
        this.quantity = quantity;
        this.avgPrice = avgPrice;
    }

    getName() { return this.asset.symbol; }

    getValue(proveedor) {
        return this.quantity * proveedor.obtenerPrecio(this.asset.symbol).precio;
    }

    getCost() { return this.quantity * this.avgPrice; }

    countPositions() { return 1; }

    toTree(proveedor) {

        const precioActual = proveedor.obtenerPrecio(this.asset.symbol).precio;
        const valor = this.quantity * precioActual;
        const costo = this.getCost();

        return {
            tipo: 'posicion',
            nombre: this.asset.symbol,
            activo: this.asset.name,
            categoria: this.asset.category,
            cantidad: this.quantity,
            cantidadFormateada: this.asset.formatQuantity(this.quantity),
            precioPromedio: round(this.avgPrice),
            precioActual: round(precioActual),
            valor: round(valor),
            costo: round(costo),
            ganancia: round(valor - costo)
        };
    }
}

function round(n) { return Number(n.toFixed(2)); }

module.exports = Position;
