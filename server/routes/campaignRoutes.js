import { Router } from 'express';
import { campaignController } from '../controllers/campaignController.js';
import { whatsappController } from '../controllers/whatsappController.js';
import { authenticateToken, requireManagerOrAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/audiences', campaignController.getAudiences);
router.get('/meta-templates', campaignController.getMetaTemplates);
router.post('/send-test', requireManagerOrAdmin, campaignController.sendTestMessage);
router.get('/message-status/:wamid', whatsappController.getMessageStatus);
router.get('/', campaignController.getAll);
router.post('/', requireManagerOrAdmin, campaignController.create);
router.get('/:id', campaignController.getById);
router.put('/:id', requireManagerOrAdmin, campaignController.update);
router.put('/:id/status', requireManagerOrAdmin, campaignController.updateStatus);
router.patch('/:id/status', requireManagerOrAdmin, campaignController.updateStatus);
router.delete('/:id', requireManagerOrAdmin, campaignController.delete);

// Bulk Recipient Queue & Delivery Engine Routes
router.get('/:id/recipients', campaignController.getRecipients);
router.post('/:id/process-batch', requireManagerOrAdmin, campaignController.processBatch);
router.post('/:id/send-now', requireManagerOrAdmin, campaignController.sendNow);

export default router;
