import { Router } from 'express';
import { inboxController } from '../controllers/inboxController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/conversations', inboxController.getConversations);
router.get('/conversations/:id', inboxController.getConversationById);
router.put('/conversations/:id', inboxController.updateConversation);
router.post('/conversations', inboxController.createConversation);
router.post('/conversations/:id/messages', inboxController.sendMessage);
router.put('/conversations/:id/read', inboxController.markAsRead);

export default router;
