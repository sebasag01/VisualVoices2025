// models/examenSession.js
const { Schema, model } = require('mongoose');
const ExamenSessionSchema = new Schema({
  user:    { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  startedAt: { type: Date, default: Date.now },
  totalQuestions: { type: Number, default: 0 },
  correct:       { type: Number, default: 0 },
  incorrect:     { type: Number, default: 0 },
  finishedAt:    { type: Date }
});
module.exports = model('ExamenSession', ExamenSessionSchema);
