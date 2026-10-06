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

// Drip Follow-Up Sequences Routes (Must be defined before /:id)
router.get('/drip-sequences', campaignController.getDripSequences);
router.post('/drip-sequences', requireManagerOrAdmin, campaignController.createDripSequence);
router.get('/drip-sequences/:id', campaignController.getDripSequenceById);
router.put('/drip-sequences/:id', requireManagerOrAdmin, campaignController.updateDripSequence);
router.patch('/drip-sequences/:id/status', requireManagerOrAdmin, campaignController.updateDripSequenceStatus);
router.delete('/drip-sequences/:id', requireManagerOrAdmin, campaignController.deleteDripSequence);

router.get('/', campaignController.getAll);
router.post('/', requireManagerOrAdmin, campaignController.create);
router.get('/:id', campaignController.getById);
router.put('/:id', requireManagerOrAdmin, campaignController.update);
router.put('/:id/status', requireManagerOrAdmin, campaignController.updateStatus);
router.patch('/:id/status', requireManagerOrAdmin, campaignController.updateStatus);
router.delete('/:id', requireManagerOrAdmin, campaignController.delete);

// 1-Click Retargeting Route
router.post('/:id/retarget', requireManagerOrAdmin, campaignController.retarget);

// Bulk Recipient Queue & Delivery Engine Routes
router.get('/:id/recipients', campaignController.getRecipients);
router.post('/:id/process-batch', requireManagerOrAdmin, campaignController.processBatch);
router.post('/:id/send-now', requireManagerOrAdmin, campaignController.sendNow);
router.post('/:id/retry-failed', requireManagerOrAdmin, campaignController.retryFailed);

export default router;
