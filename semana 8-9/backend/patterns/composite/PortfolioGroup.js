const PortfolioComponent = require('./PortfolioComponent');

// COMPOSITE
// Un grupo (la cartera completa o una categoría: CRYPTO, TOKEN, NFT).
// Contiene Position u otros PortfolioGroup y delega en ellos los cálculos.

class PortfolioGroup extends PortfolioComponent {

    constructor(name) {
        super();
        this.name = name;
        this.children = [];
    }

    add(component) {
        this.children.push(component);
        return this;
    }

    remove(component) {
        this.children = this.children.filter(c => c !== component);
        return this;
    }

    getName() { return this.name; }

    getValue(proveedor) {
        return this.children.reduce((sum, c) => sum + c.getValue(proveedor), 0);
    }

    getCost() {
        return this.children.reduce((sum, c) => sum + c.getCost(), 0);
    }

    countPositions() {
        return this.children.reduce((sum, c) => sum + c.countPositions(), 0);
    }

    toTree(proveedor) {

        const valor = this.getValue(proveedor);
        const costo = this.getCost();

        return {
            tipo: 'grupo',
            nombre: this.name,
            posiciones: this.countPositions(),
            valor: Number(valor.toFixed(2)),
            costo: Number(costo.toFixed(2)),
            ganancia: Number((valor - costo).toFixed(2)),
            hijos: this.children.map(c => c.toTree(proveedor))
        };
    }
}

module.exports = PortfolioGroup;
