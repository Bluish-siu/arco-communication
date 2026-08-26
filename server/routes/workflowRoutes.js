import { Router } from 'express';
import { workflowController } from '../controllers/workflowController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', workflowController.getAll);
router.post('/', workflowController.create);
router.put('/:id/toggle', workflowController.toggleStatus);

export default router;
