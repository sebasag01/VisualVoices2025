// models/loginLog.js
const { Schema, model } = require('mongoose');
const LoginLogSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  date: { type: Date, required: true }
});
// único por usuario+fecha
LoginLogSchema.index({ user: 1, date: 1 }, { unique: true });
module.exports = model('LoginLog', LoginLogSchema);
