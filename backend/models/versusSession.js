// models/versusSession.js
const { Schema, model } = require('mongoose');

const VersusSessionSchema = new Schema({
  participants: [
    { 
      userId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
      name:   { type: String, required: true }
    }
  ],
  winner: {
    userId: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    name:   { type: String, required: true }
  },
  startedAt: { type: Date, default: Date.now },
  finishedAt:{ type: Date }
});

module.exports = model('VersusSession', VersusSessionSchema);
