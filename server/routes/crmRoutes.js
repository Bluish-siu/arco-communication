import { Router } from 'express';
import { crmController } from '../controllers/crmController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/pipeline', crmController.getPipeline);
router.put('/leads/:id/status', crmController.updateLeadStatus);
router.get('/reports', crmController.getReports);

export default router;
