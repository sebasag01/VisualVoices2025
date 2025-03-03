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
