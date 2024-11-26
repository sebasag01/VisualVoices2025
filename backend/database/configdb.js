const mongoose = require('mongoose');

const dbConnection = async() => {
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

