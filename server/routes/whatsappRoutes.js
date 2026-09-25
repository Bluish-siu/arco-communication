import { Router } from 'express';
import { whatsappController } from '../controllers/whatsappController.js';
import { authenticateToken, requireManagerOrAdmin } from '../middleware/auth.js';

const router = Router();

// Meta Webhook Endpoints (Public for Meta platform)
router.get('/webhook', whatsappController.verifyWebhook);
router.post('/webhook', whatsappController.verifyWebhookSignature, whatsappController.handleWebhook);

// Protected WhatsApp API Endpoints
router.get('/status', authenticateToken, whatsappController.getStatus);
router.get('/message-status/:wamid', authenticateToken, whatsappController.getMessageStatus);
router.post('/send-template', authenticateToken, requireManagerOrAdmin, whatsappController.sendTemplate);
router.get('/flows', authenticateToken, whatsappController.getFlows);
router.post('/flows', authenticateToken, requireManagerOrAdmin, whatsappController.createFlow);
router.get('/flows/:flowId', authenticateToken, whatsappController.getFlow);
router.post('/send-flow', authenticateToken, requireManagerOrAdmin, whatsappController.sendFlow);
router.post('/send-flow-bulk', authenticateToken, requireManagerOrAdmin, whatsappController.sendFlowBulk);
router.get('/flow-broadcasts', authenticateToken, whatsappController.getFlowBroadcasts);
router.get('/flow-broadcasts/:id', authenticateToken, whatsappController.getFlowBroadcast);
router.get('/flow-broadcasts/:id/recipients', authenticateToken, whatsappController.getFlowBroadcastRecipients);

export default router;
