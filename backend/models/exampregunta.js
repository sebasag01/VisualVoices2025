// models/examQuestion.js
const { Schema, model } = require('mongoose');

const exampreguntaSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  correctAnswer: {
    type: Schema.Types.ObjectId,
    ref: 'Palabra',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // Podrías poner un TTL index si deseas que caduque automáticamente
    // expires: 60  // => Expira en 60s, por ejemplo
  },
  answered: {
    type: Boolean,
    default: false
  }
});

// Opcionalmente, para no devolver _id en bruto al front
exampreguntaSchema.method('toJSON', function() {
  const { __v, _id, ...object } = this.toObject();
  // podrias re-mapear _id => questionId si quieres
  return object;
});

module.exports = model('exampregunta', exampreguntaSchema);
