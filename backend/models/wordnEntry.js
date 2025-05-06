// models/wordEntry.js
const { Schema, model } = require('mongoose');

const wordEntrySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  palabraId: {
    type: Schema.Types.ObjectId,
    ref: 'Palabra',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = model('wordEntry', wordEntrySchema);
