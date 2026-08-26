import { Router } from 'express';
import { taskController } from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', taskController.getAll);
router.post('/', taskController.create);
router.get('/:id', taskController.getById);
router.put('/:id', taskController.update);
router.put('/:id/status', taskController.updateStatus);
router.delete('/:id', taskController.delete);

export default router;
