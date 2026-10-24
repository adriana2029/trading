const AssetFlyweightFactory = require('./patterns/flyweight/AssetFlyweightFactory');
const Position = require('./patterns/composite/Position');
const { check, terminar } = require('./testHelper');

// Pedimos el mismo activo muchas veces
const a1 = AssetFlyweightFactory.get('BTC/USD');
const a2 = AssetFlyweightFactory.get('BTC/USD');
const eth = AssetFlyweightFactory.get('ETH/USD');

console.log('Flyweight BTC:', a1);
check('Dos pedidos de BTC/USD devuelven el MISMO objeto', a1 === a2);
check('BTC y ETH son objetos distintos', a1 !== eth);

// 1000 posiciones de distintos usuarios (estado extrínseco distinto)
const posiciones = [];
for (let i = 0; i < 1000; i++) {
    posiciones.push(new Position(AssetFlyweightFactory.get('BTC/USD'), i + 1, 60000 + i));
}
check('1000 posiciones comparten un único flyweight',
    posiciones.every(p => p.asset === a1));
console.log('Flyweights creados en total (BTC + ETH):', AssetFlyweightFactory.count());
check('Solo existen 2 flyweights en memoria, no 1002', AssetFlyweightFactory.count() === 2);

check('El estado extrínseco sigue siendo propio de cada posición',
    posiciones[0].quantity === 1 && posiciones[999].quantity === 1000);

check('El flyweight es inmutable', (() => {
    try { 'use strict'; a1.symbol = 'XXX'; } catch (e) { /* modo estricto lanza */ }
    return a1.symbol === 'BTC/USD';
})());

try {
    AssetFlyweightFactory.get('DOGE/USD');
} catch (error) {
    console.log('Error esperado con activo no soportado:', error.message);
    check('Activo fuera del catálogo se rechaza', true);
}

terminar();
