import { Router } from 'express';
import { settingsController } from '../controllers/settingsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
router.get('/widget', settingsController.getWidgetSettings);
router.put('/widget', settingsController.updateWidgetSettings);

export default router;
