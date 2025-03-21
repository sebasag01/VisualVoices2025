// Este archivo define un modelo de Mongoose para la colección "gltfFiles.files".
// 1. Se crea un esquema vacío ('GltfFileSchema') con 'strict: false' para permitir campos dinámicos.
// 2. Se especifica 'collection: "gltfFiles.files"' para enlazar directamente con la colección en la base de datos.
// 3. Se exporta un modelo con el nombre exacto 'gltfFiles.files', que utilizará el esquema definido.

const { Schema, model } = require('mongoose');

// Esquema vacío para la colección gltfFiles.files
const GltfFileSchema = new Schema({}, { strict: false, collection: 'gltfFiles.files' });

module.exports = model('gltfFiles.files', GltfFileSchema); // Nombre del modelo exacto