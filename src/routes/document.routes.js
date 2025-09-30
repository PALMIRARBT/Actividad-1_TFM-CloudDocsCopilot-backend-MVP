
import express from 'express';
import multer from 'multer';
import authMiddleware from '../middlewares/auth.middleware.js';
import { share, remove, upload, list, download } from '../controllers/document.controller.js';
const router = express.Router();
const upload = multer({ dest: 'storage/' });

router.post('/:id/share', authMiddleware, share);
router.delete('/:id', authMiddleware, remove);
router.post('/upload', authMiddleware, upload.single('file'), upload);
router.get('/', authMiddleware, list);
router.get('/download/:id', authMiddleware, download);

export default router;