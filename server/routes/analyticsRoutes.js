import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// Dashboard metrics
router.get('/dashboard', analyticsController.getDashboardMetrics);

// Chat & Conversation Analytics endpoints
router.get('/overview', analyticsController.getConversationOverview);
router.get('/agent-performance', analyticsController.getAgentPerformance);
router.get('/export', analyticsController.exportAnalytics);

// Custom Campaign Reports endpoints (Replicating Interakt Analytics)
router.get('/campaign-reports/campaigns', analyticsController.getCampaignsForReports);
router.post('/campaign-reports/generate', analyticsController.generateCampaignReport);

export default router;
