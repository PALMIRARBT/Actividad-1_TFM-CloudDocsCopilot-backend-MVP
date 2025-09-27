const express = require('express');
const {
  createFolder,
  getFolders,
  getFolder,
  updateFolder,
  deleteFolder,
  shareFolder
} = require('../controllers/folderController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(protect);

// Rutas
router.route('/')
  .get(getFolders)
  .post(createFolder);

router.route('/:id')
  .get(getFolder)
  .put(updateFolder)
  .delete(deleteFolder);

router.put('/:id/share', shareFolder);

module.exports = router;