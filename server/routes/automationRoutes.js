import { Router } from 'express';
import { automationController } from '../controllers/automationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// 1. Basic Automations (Settings / Working Hours)
router.get('/settings', automationController.getSettings);
router.put('/settings', automationController.updateSettings);

// 2. Custom Auto Replies
router.get('/custom-replies', automationController.getCustomReplies);
router.post('/custom-replies', automationController.createCustomReply);
router.put('/custom-replies/:id', automationController.updateCustomReply);
router.delete('/custom-replies/:id', automationController.deleteCustomReply);
router.put('/custom-replies/:id/toggle', automationController.toggleCustomReply);
router.post('/custom-replies/:id/duplicate', automationController.duplicateCustomReply);

// 3. Workflows
router.get('/workflows', automationController.getWorkflows);
router.get('/workflows/:id', automationController.getWorkflowById);
router.post('/workflows', automationController.createWorkflow);
router.put('/workflows/:id', automationController.updateWorkflow);
router.delete('/workflows/:id', automationController.deleteWorkflow);
router.put('/workflows/:id/toggle', automationController.toggleWorkflow);
router.post('/workflows/:id/duplicate', automationController.duplicateWorkflow);
router.post('/workflows/:id/test', automationController.testWorkflowExecution);

// 4. AI Intent Matching
router.get('/ai-intent', automationController.getAiIntentData);
router.put('/ai-intent/settings', automationController.updateAiIntentSettings);
router.post('/ai-intent/intents', automationController.createAiIntent);
router.put('/ai-intent/intents/:id', automationController.updateAiIntent);
router.delete('/ai-intent/intents/:id', automationController.deleteAiIntent);
router.post('/ai-intent/test', automationController.testIntentMatching);

// 5. WhatsApp AI Agent
router.get('/ai-agent', automationController.getAiAgentData);
router.put('/ai-agent/config', automationController.updateAiAgentConfig);
router.post('/ai-agent/sources', automationController.addTrainingSource);
router.delete('/ai-agent/sources/:id', automationController.removeTrainingSource);
router.post('/ai-agent/chat', automationController.testAiAgentChat);

// 6. Instagram Quickflows
router.get('/quickflows', automationController.getQuickflows);
router.post('/quickflows', automationController.createQuickflow);
router.put('/quickflows/:id', automationController.updateQuickflow);
router.delete('/quickflows/:id', automationController.deleteQuickflow);
router.put('/quickflows/:id/toggle', automationController.toggleQuickflow);
router.post('/quickflows/:id/duplicate', automationController.duplicateQuickflow);

// 7. Voice AI / My Call Genie
router.get('/voice-ai', automationController.getVoiceAiData);
router.put('/voice-ai/config', automationController.updateVoiceAiConfig);
router.post('/voice-ai/simulate-call', automationController.simulateInboundCall);

// 8. WhatsApp Forms
router.get('/forms', automationController.getForms);
router.get('/forms/:id', automationController.getFormById);
router.post('/forms', automationController.createForm);
router.put('/forms/:id', automationController.updateForm);
router.delete('/forms/:id', automationController.deleteForm);
router.post('/forms/:id/duplicate', automationController.duplicateForm);
router.get('/forms/:formId/responses', automationController.getFormResponses);
router.post('/forms/:formId/submit', automationController.submitFormResponse);

// 9. Interactive Lists
router.get('/interactive-lists', automationController.getInteractiveLists);
router.post('/interactive-lists', automationController.createInteractiveList);
router.put('/interactive-lists/:id', automationController.updateInteractiveList);
router.delete('/interactive-lists/:id', automationController.deleteInteractiveList);
router.post('/interactive-lists/:id/duplicate', automationController.duplicateInteractiveList);

// 10. Master Execution Engine & Logs
router.post('/execute', automationController.executeAutomationEngine);
router.post('/simulate', automationController.executeAutomationEngine);
router.get('/logs', automationController.getExecutionLogs);

export default router;
