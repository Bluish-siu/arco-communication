import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Apply dedicated rate limiting (10 req/min/IP) to all auth endpoints
router.use(authLimiter);

// Standard login & user info
router.post('/login', authController.login);
router.post('/phone', authController.loginWithPhone);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/onboarding', authenticateToken, authController.updateOnboarding);

// Real Google OAuth 2.0 / OpenID Connect routes
router.get('/google/url', authController.getGoogleAuthUrl);
router.get('/google', authController.getGoogleAuthUrl);
router.get('/google/callback', authController.handleGoogleCallback);
router.post('/google/callback', authController.handleGoogleCallback);

export default router;
