// models/stats.js
const { Schema, model } = require('mongoose');

const StatsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  level: {
    type: Number,
    required: true,
  },
  // Momento en que el usuario entra a un nivel
  startTime: {
    type: Date,
    default: Date.now,
  },
  // Momento en que el usuario sale / avanza de nivel
  endTime: {
    type: Date,
  },
  // Duración total en este nivel (puedes calcularla cuando ends la sesión, o en la consulta)
  durationMs: {
    type: Number,
    default: 0,
  },
});

module.exports = model('Stats', StatsSchema);
