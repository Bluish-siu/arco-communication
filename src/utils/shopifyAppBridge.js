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

  // 1. If window.shopify already exists, immediately return it
  if (window.shopify) {
    return Promise.resolve(window.shopify);
  }

  return new Promise((resolve) => {
    // 2. Check if script element already exists in the document (e.g. declared in index.html)
    const existing = document.querySelector(`script[src="${APP_BRIDGE_SCRIPT_URL}"]`);
    if (existing) {
      if (window.shopify) {
        return resolve(window.shopify);
      }

      // Check if already finished loading
      if (existing.dataset.loaded === 'true' || existing.readyState === 'complete' || existing.readyState === 'loaded') {
        return resolve(window.shopify || null);
      }

      // If still loading, wait safely with cleanup and timeout
      const cleanup = () => {
        existing.removeEventListener('load', onLoad);
        existing.removeEventListener('error', onError);
        clearTimeout(timer);
      };

      const onLoad = () => {
        existing.dataset.loaded = 'true';
        cleanup();
        resolve(window.shopify || null);
      };

      const onError = () => {
        cleanup();
        resolve(null);
      };

      const timer = setTimeout(() => {
        cleanup();
        resolve(window.shopify || null);
      }, 3000);

      existing.addEventListener('load', onLoad);
      existing.addEventListener('error', onError);
      return;
    }

    // 3. Prevent duplicate script injection; only inject if not present
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
    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve(window.shopify || null);
    };
    script.onerror = (err) => {
      console.warn('[Shopify App Bridge] Failed to load CDN script:', err);
      resolve(null);
    };
    document.head.appendChild(script);
  });
}

/**
 * Retrieves a short-lived Shopify ID Token (Session Token) via App Bridge
 * Enforces a strict 5-second timeout to prevent UI freezes.
 * @returns {Promise<string|null>}
 */
export async function getShopifyIdToken() {
  if (!isShopifyEmbedded()) return null;

  const TOKEN_TIMEOUT_MS = 5000;
  const timeoutMessage = 'Shopify App Bridge session token request timed out. Please reload the Shopify app and try again.';

  const fetchToken = async () => {
    const shopify = await ensureAppBridgeLoaded();
    const tokenFn = (shopify && typeof shopify.idToken === 'function')
      ? shopify.idToken
      : (window.shopify && typeof window.shopify.idToken === 'function')
        ? window.shopify.idToken
        : null;

    if (!tokenFn) {
      throw new Error('Shopify App Bridge is not available in the current frame.');
    }

    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new Error(timeoutMessage));
      }, TOKEN_TIMEOUT_MS);
    });

    try {
      const token = await Promise.race([
        tokenFn(),
        timeoutPromise,
      ]);
      return token || null;
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    const token = await fetchToken();
    return token;
  } catch (err) {
    console.warn('[Shopify App Bridge] Session token error:', err.message);
    throw err;
  }
}

/**
 * Generates headers containing Authorization: Bearer <ID_TOKEN> if available
 */
export async function getShopifyAuthHeaders() {
  try {
    const idToken = await getShopifyIdToken();
    if (idToken) {
      return {
        Authorization: `Bearer ${idToken}`,
      };
    }
  } catch {
    // Gracefully return empty headers if token acquisition fails
  }
  return {};
}
