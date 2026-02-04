import express from 'express';
import * as deletionController from '../controllers/deletion.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware';
import { requireActiveOrganization } from '../middlewares/organization.middleware';
import { requireAdmin } from '../middlewares/role.middleware';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * Papelera de reciclaje
 */

// GET /api/deletion/trash - Obtener documentos en la papelera
router.get(
  '/trash',
  deletionController.getTrash
);

// DELETE /api/deletion/trash - Vaciar toda la papelera
router.delete(
  '/trash',
  deletionController.emptyTrash
);

/**
 * Operaciones sobre documentos individuales
 */

// POST /api/deletion/:id/trash - Mover documento a papelera (soft delete)
router.post(
  '/:id/trash',
  deletionController.moveToTrash
);

// POST /api/deletion/:id/restore - Restaurar documento de la papelera
router.post(
  '/:id/restore',
  deletionController.restoreFromTrash
);

// DELETE /api/deletion/:id/permanent - Eliminación permanente con sobrescritura segura
router.delete(
  '/:id/permanent',
  deletionController.permanentDelete
);

// GET /api/deletion/:id/history - Historial de eliminaciones de un documento
router.get(
  '/:id/history',
  deletionController.getDocumentDeletionHistory
);

/**
 * Auditoría de eliminaciones (solo para admins)
 */

// GET /api/deletion/audit/organization - Auditoría de eliminaciones de la organización
router.get(
  '/audit/organization',
  requireActiveOrganization,
  requireAdmin,
  deletionController.getOrganizationDeletionAudit
);

export default router;
