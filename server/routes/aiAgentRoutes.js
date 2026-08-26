import { Router } from 'express';
import { aiAgentController } from '../controllers/aiAgentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', aiAgentController.getAll);
router.post('/query', aiAgentController.processQuery);

export default router;
