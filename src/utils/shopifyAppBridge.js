/**
 * Shopify App Bridge Utility for ARCO Communication
 * Supports Shopify embedded app execution in Shopify Admin without extra build dependencies.
 * Modern App Bridge v4 loads automatically via CDN script when running inside Shopify Admin.
 */

const APP_BRIDGE_SCRIPT_URL = 'https://cdn.shopify.com/shopifycloud/app-bridge.js';

/**
 * Checks whether the current window is executing as an embedded app inside Shopify Admin
 */
export function isShopifyEmbedded() {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    const hasHost = !!params.get('host');
    const hasEmbedded = params.get('embedded') === '1';
    const inIframe = window.top !== window.self;

    // Cache in sessionStorage for internal client-side route transitions
    if ((hasHost || hasEmbedded) && inIframe) {
      sessionStorage.setItem('arco_shopify_embedded', 'true');
      if (params.get('host')) sessionStorage.setItem('arco_shopify_host', params.get('host'));
      if (params.get('shop')) sessionStorage.setItem('arco_shopify_shop', params.get('shop'));
      return true;
    }

    return inIframe && sessionStorage.getItem('arco_shopify_embedded') === 'true';
  } catch {
    return false;
  }
}

/**
 * Retrieves Shopify URL search parameters (host, shop)
 */
export function getShopifyParams() {
  if (typeof window === 'undefined') return { host: null, shop: null };
  const params = new URLSearchParams(window.location.search);
  const host = params.get('host') || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('arco_shopify_host') : null);
  const shop = params.get('shop') || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('arco_shopify_shop') : null);
  return { host, shop };
}

/**
 * Ensures Shopify App Bridge script is loaded into the document if embedded
 */
export function ensureAppBridgeLoaded() {
  if (typeof window === 'undefined' || !isShopifyEmbedded()) return Promise.resolve(null);

  if (window.shopify) {
    return Promise.resolve(window.shopify);
  }

  return new Promise((resolve, reject) => {
    // Check if script element already exists
    const existing = document.querySelector(`script[src="${APP_BRIDGE_SCRIPT_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.shopify));
      existing.addEventListener('error', (e) => reject(e));
      return;
    }

    const apiKey = import.meta.env?.VITE_SHOPIFY_API_KEY;
    if (apiKey) {
      let metaTag = document.querySelector('meta[name="shopify-api-key"]');
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.name = 'shopify-api-key';
        metaTag.content = apiKey;
        document.head.appendChild(metaTag);
      }
    }

    const script = document.createElement('script');
    script.src = APP_BRIDGE_SCRIPT_URL;
    script.async = true;
    if (apiKey) {
      script.setAttribute('data-api-key', apiKey);
    }
    script.onload = () => resolve(window.shopify);
    script.onerror = (err) => {
      console.warn('[Shopify App Bridge] Failed to load CDN script:', err);
      resolve(null);
    };
    document.head.appendChild(script);
  });
}

/**
 * Retrieves a short-lived Shopify ID Token (Session Token) via App Bridge
 * @returns {Promise<string|null>}
 */
export async function getShopifyIdToken() {
  if (!isShopifyEmbedded()) return null;

  try {
    const shopify = await ensureAppBridgeLoaded();
    if (shopify && typeof shopify.idToken === 'function') {
      const token = await shopify.idToken();
      return token;
    }

    // Fallback if window.shopify global is already initialized by parent frame
    if (window.shopify && typeof window.shopify.idToken === 'function') {
      return await window.shopify.idToken();
    }

    // Short retry if App Bridge is completing handshake with parent frame
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (window.shopify && typeof window.shopify.idToken === 'function') {
      return await window.shopify.idToken();
    }

    return null;
  } catch (err) {
    console.warn('[Shopify App Bridge] Failed to obtain ID token:', err.message);
    return null;
  }
}

/**
 * Generates headers containing Authorization: Bearer <ID_TOKEN> if available
 */
export async function getShopifyAuthHeaders() {
  const idToken = await getShopifyIdToken();
  if (idToken) {
    return {
      Authorization: `Bearer ${idToken}`,
    };
  }
  return {};
}
