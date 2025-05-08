// models/versusSession.js
const { Schema, model } = require('mongoose');

const VersusSessionSchema = new Schema({
  participants: [
    { 
      userId: { type: String, required: true }, 
      name:   { type: String, required: true }
    }
  ],
  winner: {
    userId: { type: String, required: true },
    name:   { type: String, required: true }
  },
  finishedAt: { type: Date, default: Date.now }
});

module.exports = model('VersusSession', VersusSessionSchema);
