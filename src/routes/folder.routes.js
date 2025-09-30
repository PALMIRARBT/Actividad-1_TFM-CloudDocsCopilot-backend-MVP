import express from 'express';
import { create, list } from '../controllers/folder.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, create);
router.get('/', authMiddleware, list);

export default router;