// Este archivo define el modelo "Stats" para almacenar estadísticas de sesión de usuarios.
// 1. El campo 'userId' referencia al modelo 'Usuario' y es obligatorio.
// 2. El campo 'mode' define en qué modo está la sesión, permitiendo los valores "guiado", "libre" o "examen".
// 3. El campo 'level' indica el nivel en el que se realiza la sesión, requerido solo si 'mode' no es "libre".
// 4. 'startTime' es la fecha y hora de inicio de la sesión, por defecto asignada al momento actual.
// 5. 'endTime' es la fecha y hora de finalización de la sesión, inicialmente vacío hasta que la sesión termine.
// 6. 'durationMs' almacena la duración total de la sesión en milisegundos, con valor por defecto 0.
// 7. Se exporta el modelo 'Stats' basado en este esquema.

// models/stats.js
const { Schema, model } = require('mongoose');

const StatsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true,
  },
  mode: {
    type: String,
    enum: ['guiado', 'libre', 'examen'],
    required: true,
  },
  level: {
    type: Number,
    required: function() {
      return this.mode !== 'libre'; // Si el modo es 'libre', level no es requerido.
    },
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  durationMs: {
    type: Number,
    default: 0,
  },
});

module.exports = model('Stats', StatsSchema);
