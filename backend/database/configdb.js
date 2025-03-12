const mongoose = require('mongoose');

// La función 'dbConnection' establece la conexión con la base de datos mediante Mongoose.
// 1. Utiliza 'process.env.DBCONNECTION' para obtener la cadena de conexión desde las variables de entorno.
// 2. Si la conexión es exitosa, muestra por consola el nombre de la base de datos conectada.
// 3. Si ocurre un error, lo captura y lanza una excepción para indicar que no pudo iniciar la conexión.
const dbConnection = async () => {
    try {
        const conn = await mongoose.connect(process.env.DBCONNECTION);
        console.log(`DB online, connected to: ${conn.connection.name}`);
    } catch (error) {
        console.error('Error al iniciar la BD:', error);
        throw new Error('Error al iniciar la BD');
    }
};

module.exports = {
    dbConnection
};