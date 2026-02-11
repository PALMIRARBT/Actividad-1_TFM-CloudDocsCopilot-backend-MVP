import express from 'express';
import authMiddleware from '../middlewares/auth.middleware';
import { validateOrganizationMembership } from '../middlewares/organization.middleware';
import * as commentController from '../controllers/comment.controller';

const router = express.Router();

/**
 * Todas las rutas requieren autenticación
 */
router.use(authMiddleware);

/**
 * @route   GET /api/comments/documents/:documentId
 * @desc    Lista comentarios de un documento
 * @access  Authenticated users with access to the document
 */
router.get(
  '/documents/:documentId',
  validateOrganizationMembership('params'),
  commentController.listByDocument
);

/**
 * @route   POST /api/comments/documents/:documentId
 * @desc    Crea un comentario para un documento
 * @access  Authenticated users with access to the document
 */
router.post(
  '/documents/:documentId',
  validateOrganizationMembership('params'),
  commentController.create
);

/**
 * @route   PATCH /api/comments/:commentId
 * @desc    Actualiza un comentario (solo autor)
 * @access  Authenticated users (author only)
 */
router.patch('/:commentId', commentController.update);

export default router;
