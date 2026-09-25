import crypto from 'crypto';

/**
 * Generates Meta Graph API appsecret_proof using HMAC-SHA256.
 *
 * Formula: HMAC-SHA256(access_token, META_APP_SECRET)
 *
 * @param {string} accessToken - Meta user, system, or page access token
 * @param {string} [appSecret] - Meta App Secret (defaults to process.env.META_APP_SECRET)
 * @returns {string} Hex-encoded HMAC-SHA256 proof
 */
export function generateAppSecretProof(accessToken, appSecret = process.env.META_APP_SECRET) {
  if (!accessToken) {
    throw new Error('Access token is required to generate Meta appsecret_proof');
  }

  const effectiveSecret = appSecret || process.env.META_APP_SECRET;

  if (!effectiveSecret) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[SECURITY WARNING] META_APP_SECRET is not configured. Meta appsecret_proof generation skipped.');
    }
    return null;
  }

  return crypto.createHmac('sha256', effectiveSecret).update(accessToken).digest('hex');
}

/**
 * Appends appsecret_proof query parameter to a Meta Graph API request URL.
 *
 * @param {string} rawUrl - Target Meta Graph API URL
 * @param {string} accessToken - Access token used for request
 * @param {string} [appSecret] - Optional App Secret override
 * @returns {string} Graph API URL with appsecret_proof parameter appended
 */
export function appendAppSecretProof(rawUrl, accessToken, appSecret) {
  if (!rawUrl || !accessToken) return rawUrl;

  const proof = generateAppSecretProof(accessToken, appSecret);
  if (!proof) return rawUrl;

  const separator = rawUrl.includes('?') ? '&' : '?';
  return `${rawUrl}${separator}appsecret_proof=${proof}`;
}

/**
 * Sanitizes Meta API URLs by masking secrets, tokens, and appsecret_proof in log output.
 * Prevents accidental credential leakage into server logs.
 *
 * @param {string} url - Raw URL or URL string
 * @returns {string} Sanitized URL
 */
export function sanitizeMetaUrl(url) {
  if (!url || typeof url !== 'string') return url;
  return url
    .replace(/([?&]appsecret_proof=)[^&]+/gi, '$1[REDACTED]')
    .replace(/([?&]access_token=)[^&]+/gi, '$1[REDACTED]')
    .replace(/([?&]client_secret=)[^&]+/gi, '$1[REDACTED]');
}
