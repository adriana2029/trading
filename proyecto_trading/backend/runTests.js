// Ejecuta todos los scripts de prueba de los patrones, uno tras otro.
const { spawnSync } = require('child_process');

const pruebas = [
    'testSingleton.js', 'testFactory.js', 'testBuilder.js', 'testAdapter.js', 'testBridge.js',
    'testComposite.js', 'testDecorator.js', 'testFacade.js', 'testFlyweight.js', 'testProxy.js',
    'testIntegracion.js'
];

let fallidas = 0;

for (const p of pruebas) {
    console.log(`\n================ ${p} ================`);
    const r = spawnSync('node', [p], { stdio: 'inherit' });
    if (r.status !== 0) fallidas++;
}

console.log(fallidas ? `\n${fallidas} prueba(s) fallaron` : '\nTODAS LAS PRUEBAS PASARON');
process.exit(fallidas ? 1 : 0);
