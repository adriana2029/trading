const express = require('express');
const cors = require('cors');

// Rutas
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Preparar la base de datos
require('./database/database');

const app = express();

const PORT = 3000;


// Permite recibir datos en formato JSON
app.use(express.json());


// Permite comunicación con el frontend
app.use(cors());


// Permite acceder al frontend
app.use(express.static('../frontend'));


// Rutas de autenticación
app.use('/api/auth', authRoutes);


// Rutas de órdenes
app.use('/api/orders', orderRoutes);


// Ruta principal
app.get('/', (req, res) => {

    res.send('¡Servidor del simulador de Trading funcionando!');

});


// Iniciar servidor
app.listen(PORT, () => {

    console.log(`Servidor funcionando en http://localhost:${PORT}`);

});