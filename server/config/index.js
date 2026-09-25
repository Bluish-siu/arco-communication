import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  host: process.env.HOST || '0.0.0.0',
  jwtSecret: process.env.JWT_SECRET || 'arco_super_secure_jwt_secret_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  shopifyApiKey: process.env.SHOPIFY_API_KEY || '',
  shopifyApiSecret: process.env.SHOPIFY_API_SECRET || '',
  shopifyScopes: process.env.SHOPIFY_SCOPES || 'read_products,read_orders,read_customers',
  shopifyAppUrl: process.env.SHOPIFY_APP_URL || process.env.FRONTEND_URL || 'http://localhost:5173',
  shopifyRedirectUri: process.env.SHOPIFY_REDIRECT_URI || 'http://localhost:5000/api/integrations/shopify/callback',
  shopifyWebhookBaseUrl: process.env.SHOPIFY_WEBHOOK_BASE_URL || 'https://arco-backend-ecbl.onrender.com',
  dbPath: path.join(__dirname, '../data/database.json'),
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || (process.env.SMTP_USER ? `"ARCO Communication" <${process.env.SMTP_USER}>` : '"ARCO Communication" <no-reply@arco.com>'),
  },
  metaAppSecret: process.env.META_APP_SECRET || '',
};

// Validate critical security secrets in production
if (config.nodeEnv === 'production') {
  if (!process.env.JWT_SECRET) {
    console.error('[SECURITY CRITICAL] JWT_SECRET must be explicitly defined in production environment.');
    throw new Error('FATAL: JWT_SECRET must be defined in production environment.');
  }
  if (!process.env.META_APP_SECRET) {
    console.warn('[SECURITY WARNING] META_APP_SECRET is not configured in production environment. Meta webhook signature verification and appsecret_proof will be bypassed until META_APP_SECRET is added to Render environment variables.');
  }
}
