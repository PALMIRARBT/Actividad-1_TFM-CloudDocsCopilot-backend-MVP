const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  originalName: {
    type: String,
    required: [true, 'El nombre original del archivo es requerido']
  },
  filename: {
    type: String,
    required: [true, 'El nombre del archivo es requerido'],
    unique: true
  },
  path: {
    type: String,
    required: [true, 'La ruta del archivo es requerida']
  },
  size: {
    type: Number,
    required: [true, 'El tamaño del archivo es requerido']
  },
  mimeType: {
    type: String,
    required: [true, 'El tipo MIME es requerido']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    default: null
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'write'],
      default: 'read'
    }
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  tags: [String],
  description: {
    type: String,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  }
}, {
  timestamps: true
});

// Índices para mejorar búsquedas
documentSchema.index({ owner: 1, originalName: 1 });
documentSchema.index({ owner: 1, folder: 1 });
documentSchema.index({ tags: 1 });

module.exports = mongoose.model('Document', documentSchema);