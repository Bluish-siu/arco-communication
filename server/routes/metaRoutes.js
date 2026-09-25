import { Router } from 'express';
import { metaController } from '../controllers/metaController.js';
import { authenticateToken, requireAdmin, requireManagerOrAdmin } from '../middleware/auth.js';

const router = Router();

// Public / OAuth entry
router.get('/auth', metaController.getAuthUrl);
router.get('/callback', metaController.handleCallback);

// Protected WhatsApp Business endpoints
router.get('/status', authenticateToken, metaController.getStatus);
router.get('/verify-connection', authenticateToken, metaController.verifyConnection);
router.post('/upload-gst', authenticateToken, requireManagerOrAdmin, metaController.uploadGstCertificate);
router.get('/businesses', authenticateToken, metaController.getBusinesses);
router.get('/wabas', authenticateToken, metaController.getWabas);
router.get('/phone-numbers', authenticateToken, metaController.getPhoneNumbers);
router.post('/connect', authenticateToken, requireAdmin, metaController.connect);
router.post('/disconnect', authenticateToken, requireAdmin, metaController.disconnect);

// Protected CTWA (Click-to-WhatsApp Ads) & Facebook Page endpoints
router.get('/ctwa/status', authenticateToken, metaController.getCtwaStatus);
router.post('/ctwa/page/draft', authenticateToken, requireManagerOrAdmin, metaController.saveFacebookPageDraft);
router.post('/ctwa/page/create', authenticateToken, requireManagerOrAdmin, metaController.createFacebookPage);
router.post('/ctwa/ad-account/connect', authenticateToken, requireAdmin, metaController.connectAdAccount);
router.get('/ctwa/assets', authenticateToken, metaController.getCtwaAssets);
router.post('/ctwa/disconnect', authenticateToken, requireAdmin, metaController.disconnectCtwa);

export default router;
