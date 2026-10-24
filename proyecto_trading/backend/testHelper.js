// Utilidad mínima para las pruebas: imprime el resultado y falla si no se cumple.
let fallos = 0;

function check(descripcion, condicion) {
    console.log(`${condicion ? '✔' : '✘'} ${descripcion}:`, Boolean(condicion));
    if (!condicion) fallos++;
}

function terminar() {
    if (fallos > 0) {
        console.log(`\n${fallos} comprobación(es) fallaron`);
        process.exit(1);
    }
    console.log('\nTodas las comprobaciones pasaron');
}

module.exports = { check, terminar };
