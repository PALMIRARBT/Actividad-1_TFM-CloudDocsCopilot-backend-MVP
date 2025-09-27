const express = require('express');
const {
  uploadDocument,
  getDocuments,
  downloadDocument,
  deleteDocument,
  shareDocument
} = require('../controllers/documentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(protect);

// Rutas
router.route('/')
  .get(getDocuments)
  .post(upload.single('file'), uploadDocument);

router.route('/:id')
  .delete(deleteDocument);

router.get('/:id/download', downloadDocument);
router.put('/:id/share', shareDocument);

module.exports = router;