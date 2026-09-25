import { Router } from 'express';
import { templateController } from '../controllers/templateController.js';
import { authenticateToken, requireAdmin, requireManagerOrAdmin } from '../middleware/auth.js';

const router = Router();

// Mount authentication middleware
router.use(authenticateToken);

// GET /api/templates/library
router.get('/library', templateController.getLibraryTemplates);

// GET /api/templates (Active user templates)
router.get('/', templateController.getActiveTemplates);

// GET /api/templates/deleted (Soft-deleted templates)
router.get('/deleted', templateController.getDeletedTemplates);

// POST /api/templates (Create template)
router.post('/', requireManagerOrAdmin, templateController.createTemplate);

// POST /api/templates/sync (Synchronize templates with Meta)
router.post('/sync', requireManagerOrAdmin, templateController.syncTemplates);

// GET /api/templates/:id (Single template)
router.get('/:id', templateController.getTemplateById);

// PUT /api/templates/:id (Update template)
router.put('/:id', requireManagerOrAdmin, templateController.updateTemplate);

// DELETE /api/templates/:id (Soft delete)
router.delete('/:id', requireManagerOrAdmin, templateController.deleteTemplate);

// DELETE /api/templates/:id/permanent (Permanent delete)
router.delete('/:id/permanent', requireAdmin, templateController.deletePermanent);

// POST /api/templates/:id/restore (Restore soft deleted)
router.post('/:id/restore', requireManagerOrAdmin, templateController.restoreTemplate);

// POST /api/templates/:id/duplicate (Clone template)
router.post('/:id/duplicate', requireManagerOrAdmin, templateController.duplicateTemplate);

// POST /api/templates/:id/submit (Submit for Meta Approval)
router.post('/:id/submit', requireManagerOrAdmin, templateController.submitTemplate);

// POST /api/templates/:id/test (Send test WhatsApp message)
router.post('/:id/test', requireManagerOrAdmin, templateController.testTemplate);

export default router;
