const { Schema, model } = require('mongoose');

const CategoryEntrySchema = new Schema({
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
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = model('CategoryEntry', CategoryEntrySchema);
