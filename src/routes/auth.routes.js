import express from 'express';
import { register, login, update } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/:id', update);

export default router;