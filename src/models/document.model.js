const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  filename: String,
  originalname: String,
  url: String,
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder' },
  uploadedAt: { type: Date, default: Date.now },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Document', documentSchema);