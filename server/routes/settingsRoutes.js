import { Router } from 'express';
import { settingsController } from '../controllers/settingsController.js';
import { authenticateToken, requireAdmin, requireManagerOrAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', settingsController.getSettings);
router.put('/', requireAdmin, settingsController.updateSettings);
router.get('/widget', settingsController.getWidgetSettings);
router.put('/widget', requireAdmin, settingsController.updateWidgetSettings);

// Dashboard Aggregated State & Setup Actions
router.get('/dashboard-state', settingsController.getDashboardState);
router.post('/team-members', requireAdmin, settingsController.inviteTeamMember);
router.put('/whatsapp-profile', requireManagerOrAdmin, settingsController.updateWhatsAppProfile);
router.post('/google-sheets', requireAdmin, settingsController.saveGoogleSheetsConfig);
router.put('/support-automation', requireManagerOrAdmin, settingsController.saveSupportAutomation);
router.post('/automated-alerts', requireManagerOrAdmin, settingsController.saveAutomatedAlerts);

export default router;
