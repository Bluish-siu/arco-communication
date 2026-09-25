import { Router } from 'express';
import { contactController } from '../controllers/contactController.js';
import { authenticateToken, requireManagerOrAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/count', contactController.getCount);
router.get('/', contactController.getAll);
router.post('/', contactController.create);
router.post('/bulk-upload', contactController.bulkUpload);
router.post('/bulk-delete', requireManagerOrAdmin, contactController.bulkDelete);
router.post('/bulk-tag', contactController.bulkTag);
router.put('/:id', contactController.update);
router.delete('/:id', requireManagerOrAdmin, contactController.delete);

export default router;
