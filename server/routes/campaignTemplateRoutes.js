import { Router } from 'express';
import { campaignController } from '../controllers/campaignController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', campaignController.getTemplates);
router.get('/:id', campaignController.getTemplateById);

export default router;
