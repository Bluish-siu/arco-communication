import { Router } from 'express';
import { whatsappController } from '../controllers/whatsappController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Meta Webhook Endpoints (Public for Meta platform)
router.get('/webhook', whatsappController.verifyWebhook);
router.post('/webhook', whatsappController.handleWebhook);

// Protected WhatsApp API Endpoints
router.get('/status', authenticateToken, whatsappController.getStatus);
router.post('/send-template', authenticateToken, whatsappController.sendTemplate);

export default router;
