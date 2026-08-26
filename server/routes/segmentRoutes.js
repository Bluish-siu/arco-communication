import { Router } from 'express';
import { segmentController } from '../controllers/segmentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', segmentController.getAll);
router.get('/metadata', segmentController.getMetadata);
router.get('/:id', segmentController.getById);
router.post('/', segmentController.create);
router.put('/:id', segmentController.update);
router.delete('/:id', segmentController.delete);

export default router;
