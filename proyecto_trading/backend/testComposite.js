const PortfolioGroup = require('./patterns/composite/PortfolioGroup');
const Position = require('./patterns/composite/Position');
const AssetFlyweightFactory = require('./patterns/flyweight/AssetFlyweightFactory');
const { check, terminar } = require('./testHelper');

// Proveedor de precios fijo para que los resultados sean predecibles
const precios = { 'BTC/USD': 60000, 'ETH/USD': 3000, 'UNI/USD': 10 };
const proveedor = { obtenerPrecio: (a) => ({ activo: a, precio: precios[a] }) };

const btc = new Position(AssetFlyweightFactory.get('BTC/USD'), 0.5, 50000);  // 30000
const eth = new Position(AssetFlyweightFactory.get('ETH/USD'), 2, 2500);     //  6000
const uni = new Position(AssetFlyweightFactory.get('UNI/USD'), 100, 8);      //  1000

const cripto = new PortfolioGroup('Criptomonedas').add(btc).add(eth);
const tokens = new PortfolioGroup('Tokens').add(uni);
const cartera = new PortfolioGroup('Mi cartera').add(cripto).add(tokens);

// Imprime el árbol de forma compacta (recursivo, igual que el Composite)
function imprimir(nodo, nivel = 0) {
    const marca = nodo.tipo === 'grupo' ? '[+]' : ' - ';
    console.log(`${'   '.repeat(nivel)}${marca} ${nodo.nombre}  valor=${nodo.valor}  ganancia=${nodo.ganancia}`);
    (nodo.hijos || []).forEach(h => imprimir(h, nivel + 1));
}

console.log('Árbol de la cartera:');
imprimir(cartera.toTree(proveedor));

// El cliente trata igual a una hoja y a un grupo
check('Valor de una posición (hoja) = 0.5 x 60000', btc.getValue(proveedor) === 30000);
check('Valor de un grupo = suma de sus hijos', cripto.getValue(proveedor) === 36000);
check('Valor de la cartera completa = 37000', cartera.getValue(proveedor) === 37000);
check('Costo de la cartera = 25000 + 5000 + 800', cartera.getCost() === 30800);
check('Cantidad de posiciones se cuenta recursivamente', cartera.countPositions() === 3);

cripto.remove(eth);
check('Al quitar ETH la cartera baja a 31000', cartera.getValue(proveedor) === 31000);

terminar();
