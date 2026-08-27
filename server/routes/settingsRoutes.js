import { Router } from 'express';
import { settingsController } from '../controllers/settingsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);
router.get('/widget', settingsController.getWidgetSettings);
router.put('/widget', settingsController.updateWidgetSettings);

// Dashboard Aggregated State & Setup Actions
router.get('/dashboard-state', settingsController.getDashboardState);
router.post('/team-members', settingsController.inviteTeamMember);
router.put('/whatsapp-profile', settingsController.updateWhatsAppProfile);
router.post('/google-sheets', settingsController.saveGoogleSheetsConfig);
router.put('/support-automation', settingsController.saveSupportAutomation);
router.post('/automated-alerts', settingsController.saveAutomatedAlerts);

export default router;
