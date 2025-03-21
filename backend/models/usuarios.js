// Este archivo define el modelo "Usuario" en Mongoose.
// 1. 'nombre' y 'apellidos' son campos opcionales que almacenan el nombre y los apellidos del usuario.
// 2. 'email' es obligatorio y único, siendo la principal forma de identificar al usuario.
// 3. 'password' es obligatorio y se almacena en formato hasheado para mayor seguridad.
// 4. 'imagen' puede contener la URL o la ruta de la imagen del usuario (opcional).
// 5. 'rol' define el perfil del usuario; por defecto es 'ROL_USUARIO'.
// 6. 'currentLevel' y 'currentWordIndex' indican en qué nivel y qué palabra está aprendiendo actualmente el usuario.
// 7. 'lastWordLearned' almacena la última palabra aprendida por el usuario.
// 8. 'isnewuser' es un indicador booleano para determinar si el usuario es nuevo en la aplicación.
// 9. 'exploredFreeWords' es un array de ObjectIds que referencian al modelo 'Palabra', representando las palabras que el usuario ha explorado en modo libre.
// 10. Se configura el nombre de la colección como 'usuarios'.
// 11. El método 'toJSON' se sobrescribe para modificar la estructura de salida JSON, ocultando campos sensibles como '__v', '_id' y 'password', y renombrando '_id' a 'uid'.

const { Schema, model } = require('mongoose');

const UsuarioSchema = Schema({
    nombre: {
        type: String,
        required: false
    },
    apellidos: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    imagen: {
        type: String
    },
    rol: {
        type: String,
        required: true,
        default: 'ROL_USUARIO'
    },
    currentLevel: {
        type: Number,
        default: 1
    },
    maxUnlockedLevel: {
        type: Number,
        default: 1
    },
    currentWordIndex: {
        type: Number,
        default: 0
    },
    lastWordLearned: {
        type: String,
        default: ''
    },
    isnewuser : {
        type: Boolean,
        default: true
    },
    exploredFreeWords: [{
        type: Schema.Types.ObjectId,
        ref: 'Palabra',
      }],

}, { collection: 'usuarios' });

// Se redefine el método 'toJSON' para transformar la forma en que se devuelve el objeto:
// - Elimina campos como __v, _id y password.
// - Añade un campo 'uid' que corresponde al '_id' del usuario.
UsuarioSchema.method('toJSON', function() {
    const { __v, _id, password, ...object } = this.toObject();
    object.uid = _id;
    return object;
})

module.exports = model('Usuario', UsuarioSchema);
