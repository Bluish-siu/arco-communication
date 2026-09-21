import crypto from 'crypto';
import { query } from '../config/db.js';
import { config } from '../config/index.js';

const IV_LENGTH = 16;

/**
 * Resolves the server-side encryption key safely.
 * In production, fails safely if an explicit ENCRYPTION_KEY is missing.
 */
export function getEncryptionKey() {
  const envKey = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (envKey && envKey.trim()) {
    return envKey.trim();
  }

  if (process.env.NODE_ENV === 'production') {
    console.error('[CRITICAL SECURITY ALERT]: ENCRYPTION_KEY or JWT_SECRET is not configured in production environment.');
    throw new Error('ENCRYPTION_KEY or JWT_SECRET must be configured in production environment.');
  }

  // Development / test fallback only
  return 'arco_aes256_secret_key_32_bytes_len!';
}

/**
 * Derives a consistent 32-byte key from the configured encryption secret.
 */
function deriveKey() {
  const secret = getEncryptionKey();
  return crypto.createHash('sha256').update(String(secret)).digest();
}

/**
 * Encrypts sensitive tokens server-side using AES-256-CBC.
 * Output format: <32-hex-iv>:<hex-ciphertext>
 *
 * @param {string} text - Plaintext token to encrypt
 * @returns {string|null} Encrypted token string or null
 */
export function encryptToken(text) {
  if (!text || typeof text !== 'string') return null;
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = deriveKey();
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  } catch (err) {
    console.error('[Crypto Helper] encryptToken failed:', err.message);
    throw new Error('Encryption operation failed');
  }
}

/**
 * Decrypts sensitive tokens server-side using AES-256-CBC.
 *
 * @param {string} encryptedText - Encrypted token in <iv>:<cipher> format
 * @returns {string|null} Decrypted plaintext string or null
 */
export function decryptToken(encryptedText) {
  if (!encryptedText || typeof encryptedText !== 'string' || !encryptedText.includes(':')) {
    return null;
  }
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 2 || parts[0].length !== 32) {
      return null;
    }
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = Buffer.from(parts[1], 'hex');
    const key = deriveKey();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err) {
    console.warn('[Crypto Helper] decryptToken failed:', err.message);
    return null;
  }
}

/**
 * Checks whether a string is already in AES-256-CBC encrypted format (<32-hex-iv>:<hex-ciphertext>).
 */
export function isEncryptedToken(token) {
  if (!token || typeof token !== 'string') return false;
  return /^[0-9a-fA-F]{32}:[0-9a-fA-F]+$/.test(token.trim());
}

/**
 * Transparently decrypts an encrypted token. If the value is a legacy unencrypted
 * plaintext token, safely returns the plaintext value so existing records never break.
 *
 * @param {string} token - Encrypted or legacy plaintext token
 * @returns {string|null} Plaintext token
 */
export function decryptTokenWithFallback(token) {
  if (!token || typeof token !== 'string') return null;
  const trimmed = token.trim();
  if (isEncryptedToken(trimmed)) {
    const decrypted = decryptToken(trimmed);
    if (decrypted !== null) return decrypted;
  }
  // Fallback: value is unencrypted legacy plaintext
  return trimmed;
}

/**
 * Normalizes shop domain for consistent state binding.
 */
function normalizeShop(input) {
  if (!input || typeof input !== 'string') return '';
  let clean = input.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!clean.includes('.')) clean = `${clean}.myshopify.com`;
  return clean;
}

/**
 * Generates a cryptographically signed OAuth state token bound to the authenticated
 * user, the requested Shopify shop, a random nonce, and an expiration timestamp.
 *
 * Format: <base64url-payload>.<base64url-hmac-sha256>
 */
export function generateSignedOAuthState({ userId, shop, ttlMinutes = 15 }) {
  if (!userId) throw new Error('userId is required to generate OAuth state');
  const cleanShop = normalizeShop(shop);
  if (!cleanShop) throw new Error('Valid shop domain is required to generate OAuth state');

  const secret = config.shopifyApiSecret || getEncryptionKey();
  const payload = {
    userId: String(userId),
    shop: cleanShop,
    nonce: crypto.randomBytes(16).toString('hex'),
    exp: Date.now() + Math.max(1, ttlMinutes) * 60 * 1000,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies the integrity, authenticity, expiration, and shop binding of an OAuth state token.
 *
 * @param {string} stateString - Raw state string from OAuth callback
 * @param {string} callbackShop - Shop domain query parameter from OAuth callback
 * @returns {{ success: boolean, userId?: string, shop?: string, error?: string }}
 */
export function verifySignedOAuthState(stateString, callbackShop) {
  if (!stateString || typeof stateString !== 'string' || !stateString.includes('.')) {
    return { success: false, error: 'Malformed or missing OAuth state parameter' };
  }

  const parts = stateString.split('.');
  if (parts.length !== 2) {
    return { success: false, error: 'Invalid OAuth state token format' };
  }

  const [payloadB64, providedSig] = parts;
  const secret = config.shopifyApiSecret || getEncryptionKey();

  // 1. Verify HMAC-SHA256 signature using timing-safe comparison
  const expectedSig = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url');
  const providedBuf = Buffer.from(providedSig);
  const expectedBuf = Buffer.from(expectedSig);

  if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    return { success: false, error: 'OAuth state signature verification failed (tampered state)' };
  }

  // 2. Parse payload
  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
  } catch {
    return { success: false, error: 'Failed to decode OAuth state payload' };
  }

  // 3. Verify expiration
  if (!payload.exp || typeof payload.exp !== 'number' || Date.now() > payload.exp) {
    return { success: false, error: 'OAuth state has expired. Please initiate connection again.' };
  }

  // 4. Verify shop binding
  const cleanCallbackShop = normalizeShop(callbackShop);
  if (!cleanCallbackShop || payload.shop !== cleanCallbackShop) {
    return { success: false, error: 'OAuth state shop mismatch. Expected state shop does not match callback shop.' };
  }

  // 5. Verify user binding presence
  if (!payload.userId) {
    return { success: false, error: 'OAuth state missing user binding' };
  }

  return {
    success: true,
    userId: payload.userId,
    shop: payload.shop,
  };
}

/**
 * Migration helper: Scans shopify_integrations and safely encrypts any legacy
 * unencrypted plaintext access_token or refresh_token values without exposing them.
 */
export async function migratePlaintextShopifyTokens() {
  try {
    const records = await query(
      `SELECT id, access_token, refresh_token 
       FROM shopify_integrations 
       WHERE access_token IS NOT NULL OR refresh_token IS NOT NULL`
    );

    if (records.rows.length === 0) return 0;

    let migratedCount = 0;

    for (const row of records.rows) {
      const needsAccessEncrypt = row.access_token && !isEncryptedToken(row.access_token);
      const needsRefreshEncrypt = row.refresh_token && !isEncryptedToken(row.refresh_token);

      if (needsAccessEncrypt || needsRefreshEncrypt) {
        const encryptedAccess = needsAccessEncrypt ? encryptToken(row.access_token) : row.access_token;
        const encryptedRefresh = needsRefreshEncrypt ? encryptToken(row.refresh_token) : row.refresh_token;

        await query(
          `UPDATE shopify_integrations 
           SET access_token = $1, refresh_token = $2, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $3`,
          [encryptedAccess, encryptedRefresh, row.id]
        );
        migratedCount++;
      }
    }

    if (migratedCount > 0) {
      console.log(`[Shopify Security] Migrated ${migratedCount} legacy plaintext token(s) to AES-256 encryption.`);
    }

    return migratedCount;
  } catch (err) {
    console.warn('[Shopify Security] Token encryption migration warning:', err.message);
    return 0;
  }
}
