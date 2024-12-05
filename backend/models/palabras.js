const { Schema, model } = require('mongoose');

const PalabraSchema = Schema({
    palabra: {
        type: String,
        required: true,
    },
    categoria: {
        type: Schema.Types.ObjectId,
        ref: 'Categoria', // Referencia al modelo Categoría
        required: false,
    },
});

module.exports = model('Palabra', PalabraSchema);
