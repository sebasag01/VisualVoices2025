// backend/models/categorySession.js
const { Schema, model } = require('mongoose');

const CategorySessionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Categoria',
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  durationMs: Number
});

module.exports = model('CategorySession', CategorySessionSchema);
