import { Router } from 'express';
import { instagramController } from '../controllers/instagramController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// ==========================================
// Meta Instagram Graph API Webhook Endpoints
// Public endpoints verified via Meta token & X-Hub-Signature-256
// ==========================================
router.get('/webhook', (req, res) => instagramController.verifyWebhook(req, res));
router.post(
  '/webhook',
  (req, res, next) => instagramController.verifyWebhookSignature(req, res, next),
  (req, res) => instagramController.handleWebhook(req, res)
);

// ==========================================
// Authenticated Multi-Tenant Management Routes
// ==========================================
router.use(authenticateToken);

router.get('/status', (req, res, next) => instagramController.getStatus(req, res, next));
router.post('/connect', (req, res, next) => instagramController.connect(req, res, next));
router.post('/connect-direct', (req, res, next) => instagramController.connectDirect(req, res, next));
router.post('/disconnect', (req, res, next) => instagramController.disconnect(req, res, next));
router.post('/send-direct', (req, res, next) => instagramController.sendDirect(req, res, next));

export default router;
