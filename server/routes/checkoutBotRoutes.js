import { Router } from 'express';
import { checkoutBotController } from '../controllers/checkoutBotController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Mount authentication middleware
router.use(authenticateToken);

// GET & PUT /api/checkout-bot (Workflow Definition)
router.get('/', checkoutBotController.getWorkflow);
router.put('/', checkoutBotController.updateWorkflow);

// GET /api/checkout-bot/workflow (Alias)
router.get('/workflow', checkoutBotController.getWorkflow);
router.put('/workflow', checkoutBotController.updateWorkflow);

// GET /api/checkout-bot/status (Status, Steps remaining, KPIs)
router.get('/status', checkoutBotController.getStatus);

// POST /api/checkout-bot/publish (Set Live)
router.post('/publish', checkoutBotController.publishWorkflow);

// POST /api/checkout-bot/unpublish (Pause Workflow)
router.post('/unpublish', checkoutBotController.unpublishWorkflow);

// POST /api/checkout-bot/test (Workflow Simulator)
router.post('/test', checkoutBotController.testWorkflow);

// GET /api/checkout-bot/sessions
router.get('/sessions', checkoutBotController.getSessions);

// GET /api/checkout-bot/orders
router.get('/orders', checkoutBotController.getOrders);

export default router;
