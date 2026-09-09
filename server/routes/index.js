import { Router } from 'express';
import authRoutes from './authRoutes.js';
import contactRoutes from './contactRoutes.js';
import segmentRoutes from './segmentRoutes.js';
import campaignRoutes from './campaignRoutes.js';
import campaignTemplateRoutes from './campaignTemplateRoutes.js';
import inboxRoutes from './inboxRoutes.js';
import workflowRoutes from './workflowRoutes.js';
import crmRoutes from './crmRoutes.js';
import taskRoutes from './taskRoutes.js';
import whatsappRoutes from './whatsappRoutes.js';
import instagramRoutes from './instagramRoutes.js';
import aiAgentRoutes from './aiAgentRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import metaRoutes from './metaRoutes.js';
import commerceRoutes from './commerceRoutes.js';
import checkoutBotRoutes from './checkoutBotRoutes.js';
import templateRoutes from './templateRoutes.js';
import automationRoutes from './automationRoutes.js';
import integrationRoutes from './integrationRoutes.js';
import shopifyWebhookRoutes from './shopifyWebhookRoutes.js';

const router = Router();

// Mount all feature routes
router.use('/auth', authRoutes);
router.use('/integrations', integrationRoutes);
router.use('/shopify', shopifyWebhookRoutes);
router.use('/automation', automationRoutes);
router.use('/meta', metaRoutes);
router.use('/chat-assignment', chatAssignmentRoutes);
router.use('/contacts', contactRoutes);
router.use('/segments', segmentRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/campaign-templates', campaignTemplateRoutes);
router.use('/templates', templateRoutes);
router.use('/inbox', inboxRoutes);
router.use('/workflows', workflowRoutes);
router.use('/crm', crmRoutes);
router.use('/tasks', taskRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/commerce', commerceRoutes);
router.use('/checkout-bot', checkoutBotRoutes);
router.use('/instagram', instagramRoutes);
router.use('/ai-agents', aiAgentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/settings', settingsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: 'ARCO Communication API Server',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;
