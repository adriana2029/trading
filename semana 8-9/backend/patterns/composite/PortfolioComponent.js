// COMPONENT
// Interfaz común para elementos simples (Position) y compuestos (PortfolioGroup).
// El código cliente trata igual a una posición y a una cartera completa.

class PortfolioComponent {

    getName() { throw new Error('getName() debe implementarse'); }

    // Valor de mercado actual. 'proveedor' expone obtenerPrecio(activo)
    getValue(proveedor) { throw new Error('getValue() debe implementarse'); }

    // Costo de adquisición (cantidad x precio promedio de compra)
    getCost() { throw new Error('getCost() debe implementarse'); }

    countPositions() { throw new Error('countPositions() debe implementarse'); }

    toTree(proveedor) { throw new Error('toTree() debe implementarse'); }
}

module.exports = PortfolioComponent;
