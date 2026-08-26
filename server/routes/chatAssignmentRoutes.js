import { Router } from 'express';
import { chatAssignmentController } from '../controllers/chatAssignmentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// Settings
router.get('/settings', chatAssignmentController.getSettings);
router.put('/settings', chatAssignmentController.updateSettings);

// Custom Rules CRUD
router.get('/rules', chatAssignmentController.getRules);
router.post('/rules', chatAssignmentController.createRule);
router.put('/rules/:id', chatAssignmentController.updateRule);
router.delete('/rules/:id', chatAssignmentController.deleteRule);

// Agents & Evaluation
router.get('/agents', chatAssignmentController.getAgents);
router.post('/evaluate', chatAssignmentController.evaluateAssignment);

export default router;
