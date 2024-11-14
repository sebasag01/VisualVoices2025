const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/configbd'); 

const User = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, unique: true, allowNull: false },
}, {
    tableName: 'users', // Opcional: establece el nombre de la tabla si lo deseas
    timestamps: true, // Esto agrega createdAt y updatedAt automáticamente
});

module.exports = User;
