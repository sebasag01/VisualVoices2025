// Importación de módulos
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { dbConnection } = require('./database/configbd');

// Crear una aplicación de express
const app = express();

// Middleware para permitir CORS
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

// Conectar a la base de datos
dbConnection();

// Importar las rutas de usuarios
const usuariosRoutes = require('./routes/usuariosRoutes');

// Usar las rutas de usuarios con un prefijo de URL
app.use('/api/usuarios', usuariosRoutes);

// Ruta de prueba en la raíz
app.get('/', (req, res) => {
    res.json({
        ok: true,
        msg: 'Hola mundo'
    });
});

// Abrir la aplicación en el puerto 3000
app.listen(process.env.PORT || 3000, () => {
    console.log('Servidor corriendo en el puerto', process.env.PORT || 3000);
});
