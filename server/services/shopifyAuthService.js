import { config } from '../config/index.js';

/**
 * Shopify Authentication & Token Exchange Service
 * Implements RFC 8693 OAuth 2.0 Token Exchange for Shopify Embedded Apps.
 */
export const shopifyAuthService = {
  /**
   * Exchanges a verified App Bridge Session Token (ID Token) for an Offline Access Token
   * @param {Object} params
   * @param {string} params.shopDomain - Normalized myshopify.com domain
   * @param {string} params.idToken - Verified Shopify ID Token JWT
   * @returns {Promise<Object>} { accessToken, scope, refreshToken, expiresAt, associatedUser }
   */
  exchangeSessionTokenForOfflineToken: async ({ shopDomain, idToken }) => {
    if (!shopDomain) throw new Error('Shop domain is required for token exchange');
    if (!idToken) throw new Error('Shopify ID token is required for token exchange');

    const clientId = config.shopifyApiKey;
    const clientSecret = config.shopifyApiSecret;

    if (!clientId || !clientSecret) {
      throw new Error('SHOPIFY_API_KEY and SHOPIFY_API_SECRET must be configured for token exchange');
    }

    const tokenEndpoint = `https://${shopDomain}/admin/oauth/access_token`;

    const payload = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
      subject_token: idToken,
      subject_token_type: 'urn:ietf:params:oauth:token-type:id_token',
      requested_token_type: 'urn:shopify:params:oauth:token-type:offline-access-token',
    };

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();

    if (!response.ok || responseData.error) {
      const errMsg = responseData.error_description || responseData.error || `HTTP ${response.status}`;
      console.warn(`[Shopify Token Exchange Failed for ${shopDomain}]:`, errMsg);
      throw new Error(`Shopify token exchange failed: ${errMsg}`);
    }

    const {
      access_token,
      scope,
      expires_in,
      refresh_token,
      associated_user,
    } = responseData;

    // Calculate expiration timestamp if expires_in is returned (Shopify expiring token support)
    let expiresAt = null;
    if (expires_in && typeof expires_in === 'number') {
      expiresAt = new Date(Date.now() + expires_in * 1000).toISOString();
    }

    return {
      accessToken: access_token,
      scope: scope || config.shopifyScopes,
      refreshToken: refresh_token || null,
      expiresAt,
      associatedUser: associated_user || null,
    };
  },

  /**
   * Refreshes an expiring offline access token using a refresh token if available
   */
  refreshOfflineToken: async ({ shopDomain, refreshToken }) => {
    if (!shopDomain || !refreshToken) throw new Error('Shop domain and refresh token are required');

    const clientId = config.shopifyApiKey;
    const clientSecret = config.shopifyApiSecret;

    const tokenEndpoint = `https://${shopDomain}/admin/oauth/access_token`;

    const payload = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    };

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(`Shopify token refresh failed: ${data.error_description || data.error}`);
    }

    let expiresAt = null;
    if (data.expires_in) {
      expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
    }

    return {
      accessToken: data.access_token,
      scope: data.scope,
      refreshToken: data.refresh_token || refreshToken,
      expiresAt,
    };
  },
};
