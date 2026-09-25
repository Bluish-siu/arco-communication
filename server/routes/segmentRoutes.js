import { Router } from 'express';
import { segmentController } from '../controllers/segmentController.js';
import { authenticateToken, requireManagerOrAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', segmentController.getAll);
router.get('/metadata', segmentController.getMetadata);
router.get('/:id', segmentController.getById);
router.post('/', requireManagerOrAdmin, segmentController.create);
router.put('/:id', requireManagerOrAdmin, segmentController.update);
router.delete('/:id', requireManagerOrAdmin, segmentController.delete);

export default router;
