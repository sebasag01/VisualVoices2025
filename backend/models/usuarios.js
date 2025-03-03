const { Schema, model } = require('mongoose');

const UsuarioSchema = Schema({
    nombre: {
        type: String,
        required: true
    },
    apellidos: {
        type: String,
        required: true
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
    currentWordIndex: {
        type: Number,
        default: 0
    },
    exploredFreeWords: [{
        type: Schema.Types.ObjectId,
        ref: 'Palabra',
      }],

}, { collection: 'usuarios' });

UsuarioSchema.method('toJSON', function() {
    const { __v, _id, password, ...object } = this.toObject();
    object.uid = _id;
    return object;
})

module.exports = model('Usuario', UsuarioSchema);
