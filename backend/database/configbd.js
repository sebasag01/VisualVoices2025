require('dotenv').config(); // Importar dotenv para usar variables de entorno
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT // Agregar el puerto correcto desde el archivo .env
});

const dbConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('DB online conectada con éxito');
    } catch (error) {
        console.error('Error al conectar con la BD:', error);
        throw new Error('Error al iniciar la BD');
    }
};

module.exports = {
    sequelize,
    dbConnection
};
