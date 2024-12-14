// Importación de módulos
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { dbConnection } = require('./database/configdb');
const gltfRoutes = require('./routes/gltf');

// Crear una aplicación de express
const app = express();

// Conexión a la base de datos
dbConnection();

// Configurar CORS
app.use(cors({
    origin: ['http://localhost:4200', 'https://visualvoices.ovh'], // Permitir orígenes específicos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Incluir OPTIONS
    allowedHeaders: ['Content-Type', 'Authorization'], // Asegurar que 'Authorization' está incluido si se usa token
    credentials: true // Permitir envío de cookies si es necesario
}));

// Configurar el uso de JSON
app.use(express.json());

// Middleware para manejar preflight requests manualmente (si es necesario)
app.options('*', cors());

// Definir rutas de la API
app.get('/api', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});

app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/login', require('./routes/auth'));
app.use('/api/gltf', gltfRoutes);

// Abrir la aplicacíon en el puerto 3000
app.listen(process.env.PORT, () => {
    console.log('Servidor corriendo en el puerto ', process.env.PORT);
});
