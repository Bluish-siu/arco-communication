import { Router } from 'express';
import { metaController } from '../controllers/metaController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public / OAuth entry
router.get('/auth', metaController.getAuthUrl);
router.get('/callback', metaController.handleCallback);

// Protected WhatsApp Business endpoints
router.get('/status', metaController.getStatus);
router.get('/verify-connection', authenticateToken, metaController.verifyConnection);
router.post('/upload-gst', authenticateToken, metaController.uploadGstCertificate);
router.get('/businesses', authenticateToken, metaController.getBusinesses);
router.get('/wabas', authenticateToken, metaController.getWabas);
router.get('/phone-numbers', authenticateToken, metaController.getPhoneNumbers);
router.post('/connect', authenticateToken, metaController.connect);
router.post('/disconnect', authenticateToken, metaController.disconnect);

// Protected CTWA (Click-to-WhatsApp Ads) & Facebook Page endpoints
router.get('/ctwa/status', authenticateToken, metaController.getCtwaStatus);
router.post('/ctwa/page/draft', authenticateToken, metaController.saveFacebookPageDraft);
router.post('/ctwa/page/create', authenticateToken, metaController.createFacebookPage);
router.post('/ctwa/ad-account/connect', authenticateToken, metaController.connectAdAccount);
router.get('/ctwa/assets', authenticateToken, metaController.getCtwaAssets);
router.post('/ctwa/disconnect', authenticateToken, metaController.disconnectCtwa);

export default router;
