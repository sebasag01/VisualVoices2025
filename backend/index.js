// Importación de módulos
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { dbConnection } = require('./database/configdb');
const usuariosRoute = require('./routes/usuarios');
const loginRoute = require('./routes/auth');
const palabrasRoutes = require('./routes/palabras');
const categoriasRoutes = require('./routes/categorias');

// Crear una aplicación de express
const app = express();

// Conexión a la base de datos
dbConnection();

app.use(cookieParser());

// Configurar CORS
app.use(cors({
    origin: ['http://localhost:4200', 'https://visualvoices.ovh'], // Permitir orígenes específicos
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Incluir OPTIONS
    allowedHeaders: ['Content-Type', 'Authorization'],
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

app.use('/api/usuarios', usuariosRoute);
app.use('/api/login', loginRoute);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/palabras', palabrasRoutes);

// Abrir la aplicacíon en el puerto 3000
app.listen(process.env.PORT, () => {
    console.log('Servidor corriendo en el puerto ', process.env.PORT);
});
