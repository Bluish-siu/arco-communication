import { Router } from 'express';
import { campaignController } from '../controllers/campaignController.js';
import { whatsappController } from '../controllers/whatsappController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/audiences', campaignController.getAudiences);
router.get('/meta-templates', campaignController.getMetaTemplates);
router.post('/send-test', campaignController.sendTestMessage);
router.get('/message-status/:wamid', whatsappController.getMessageStatus);
router.get('/', campaignController.getAll);
router.post('/', campaignController.create);
router.get('/:id', campaignController.getById);
router.put('/:id', campaignController.update);
router.put('/:id/status', campaignController.updateStatus);
router.patch('/:id/status', campaignController.updateStatus);
router.delete('/:id', campaignController.delete);

// Bulk Recipient Queue & Delivery Engine Routes
router.get('/:id/recipients', campaignController.getRecipients);
router.post('/:id/process-batch', campaignController.processBatch);
router.post('/:id/send-now', campaignController.sendNow);

export default router;
