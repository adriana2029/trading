const DatabaseSingleton = require('./patterns/DatabaseSingleton');


// Crear la primera instancia

const database1 = new DatabaseSingleton();


// Crear una segunda instancia

const database2 = new DatabaseSingleton();


// Mostrar las instancias

console.log('Primera instancia:');
console.log(database1);

console.log('Segunda instancia:');
console.log(database2);


// COMPROBAR SI SON LA MISMA INSTANCIA

console.log(
    '¿Las dos instancias son iguales?',
    database1 === database2
);


// COMPROBAR SI UTILIZAN LA MISMA BASE DE DATOS

console.log(
    '¿Utilizan la misma conexión?',
    database1.getDatabase() === database2.getDatabase()
);