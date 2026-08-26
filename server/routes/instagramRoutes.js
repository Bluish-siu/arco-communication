import { Router } from 'express';
import { instagramController } from '../controllers/instagramController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/status', instagramController.getStatus);
router.post('/send-direct', instagramController.sendDirect);

export default router;
