/**
 * Meta WhatsApp & Instagram SDK Helper
 * Loads the official Meta (Facebook) JavaScript SDK v22.0 and manages
 * Embedded Signup and Instagram connection popup dialogs.
 */

const DEFAULT_APP_ID = '2872862256446175';
const DEFAULT_CONFIG_ID = '1131178462664882';
const DEFAULT_INSTAGRAM_APP_ID = import.meta.env.VITE_INSTAGRAM_APP_ID || DEFAULT_APP_ID;

export function initMetaSdk(appId = DEFAULT_APP_ID) {
  if (typeof window === 'undefined') return;

  const targetAppId = appId || DEFAULT_APP_ID;

  // 1. If FB is already on window and not initialized, initialize it right away!
  if (window.FB && typeof window.FB.init === 'function') {
    if (!window._fbInitialized) {
      try {
        window.FB.init({
          appId: targetAppId,
          autoLogAppEvents: true,
          cookie: true,
          xfbml: true,
          version: 'v22.0',
        });
        window._fbInitialized = true;
      } catch (err) {
        console.warn('[Meta SDK] Direct FB.init:', err);
      }
    }
  }

  // 2. Set up fbAsyncInit for when SDK finishes downloading
  const existingInit = window.fbAsyncInit;
  window.fbAsyncInit = function () {
    if (typeof existingInit === 'function') {
      try { existingInit(); } catch (e) {}
    }
    if (window.FB && typeof window.FB.init === 'function') {
      try {
        window.FB.init({
          appId: targetAppId,
          autoLogAppEvents: true,
          cookie: true,
          xfbml: true,
          version: 'v22.0',
        });
        window._fbInitialized = true;
      } catch (err) {
        console.warn('[Meta SDK] fbAsyncInit callback error:', err);
      }
    }
  };

  // 3. Inject script tag if not present
  if (!document.getElementById('facebook-jssdk')) {
    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }

  // 4. Setup Global message listener for Embedded Signup postMessage payloads
  if (!window._metaSignupListenerAttached) {
    window._metaSignupListenerAttached = true;
    window.addEventListener('message', (event) => {
      if (!event.origin || !event.origin.includes('facebook.com')) return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.type === 'WA_EMBEDDED_SIGNUP') {
          if (data.data?.phone_number_id) {
            sessionStorage.setItem('meta_phone_number_id', data.data.phone_number_id);
          }
          if (data.data?.waba_id) {
            sessionStorage.setItem('meta_waba_id', data.data.waba_id);
          }
        }
      } catch (e) {
        // Ignore non-json messages
      }
    });
  }
}

/**
 * Wait for Meta SDK to be initialized and ready on window.FB with valid version
 */
export function waitForMetaSdk(appId = DEFAULT_APP_ID, timeoutMs = 2500) {
  return new Promise((resolve) => {
    initMetaSdk(appId);

    function tryInitNow() {
      if (window.FB && typeof window.FB.init === 'function' && !window._fbInitialized) {
        try {
          window.FB.init({
            appId: appId || DEFAULT_APP_ID,
            autoLogAppEvents: true,
            cookie: true,
            xfbml: true,
            version: 'v22.0',
          });
          window._fbInitialized = true;
        } catch (e) {}
      }
      return window.FB && window._fbInitialized && typeof window.FB.login === 'function';
    }

    if (tryInitNow()) {
      return resolve(window.FB);
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      if (tryInitNow()) {
        clearInterval(interval);
        return resolve(window.FB);
      }
      if (Date.now() - startTime > timeoutMs) {
        clearInterval(interval);
        return resolve(null);
      }
    }, 60);
  });
}

/**
 * Open official Meta OAuth Dialog in popup window (Facebook Login with Instagram Scopes)
 */
export function openMetaOAuthDialog({ appId = DEFAULT_APP_ID } = {}) {
  const targetAppId = appId || DEFAULT_APP_ID;
  const redirectUri = encodeURIComponent(`${window.location.origin}/instagram-callback.html`);
  const scopes = encodeURIComponent(
    'pages_show_list,pages_read_engagement,pages_manage_metadata,instagram_basic,instagram_manage_messages,instagram_manage_comments'
  );
  const oauthUrl = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${targetAppId}&redirect_uri=${redirectUri}&response_type=token&scope=${scopes}`;

  const width = 650;
  const height = 750;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  const popup = window.open(
    oauthUrl,
    'MetaInstagramLogin',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
  );

  if (!popup) {
    const err = new Error('Popup blocked by browser. Please allow popups for this site.');
    err.code = 'POPUP_BLOCKED';
    return Promise.reject(err);
  }

  return new Promise((resolve, reject) => {
    let resolved = false;

    function handleMessage(event) {
      if (event.data?.type === 'IG_OAUTH_SUCCESS' && (event.data.accessToken || event.data.code)) {
        resolved = true;
        window.removeEventListener('message', handleMessage);
        resolve({
          accessToken: event.data.accessToken || null,
          code: event.data.code || null,
          status: 'connected',
        });
      } else if (event.data?.type === 'IG_OAUTH_ERROR') {
        resolved = true;
        window.removeEventListener('message', handleMessage);
        const err = new Error(event.data.error || 'Meta authorization was cancelled.');
        err.code = 'USER_CANCELLED';
        reject(err);
      }
    }

    window.addEventListener('message', handleMessage);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        setTimeout(() => {
          if (!resolved) {
            const err = new Error('Facebook Login popup was closed.');
            err.code = 'USER_CANCELLED';
            reject(err);
          }
        }, 500);
      }
    }, 600);
  });
}

/**
 * Launch Meta Embedded Signup Popup (Official Meta Flow)
 */
export async function launchMetaEmbeddedSignup({
  appId = DEFAULT_APP_ID,
  configId = DEFAULT_CONFIG_ID,
  numberType = 'wa_business',
} = {}) {
  const fb = await waitForMetaSdk(appId, 2500);

  // Fallback if FB SDK blocked by browser ad blocker
  if (!fb) {
    const hostedUrl = `https://business.facebook.com/messaging/whatsapp/onboard/?app_id=${appId}&config_id=${configId}`;
    const win = window.open(hostedUrl, '_blank', 'width=750,height=800');
    if (!win) {
      throw new Error('Popup blocked by browser. Please allow popups for this site.');
    }
    return {
      isHostedFallback: true,
      message: 'Opened Meta Onboarding dialog in separate window.',
    };
  }

  return new Promise((resolve, reject) => {
    try {
      fb.login(
        function (response) {
          if (response && response.authResponse?.code) {
            const code = response.authResponse.code;
            const wabaId = sessionStorage.getItem('meta_waba_id') || null;
            const phoneNumberId = sessionStorage.getItem('meta_phone_number_id') || null;

            resolve({
              code,
              wabaId,
              phoneNumberId,
              status: 'connected',
            });
          } else {
            const err = new Error('Meta login was cancelled or incomplete.');
            err.code = 'USER_CANCELLED';
            reject(err);
          }
        },
        {
          config_id: configId,
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            feature: 'whatsapp_embedded_signup',
            version: 4,
            sessionInfoVersion: 3,
            number_type: numberType,
          },
        }
      );
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Launch official Instagram Business Login popup dialog (Native Instagram OAuth flow as seen in Wati)
 * Directly opens instagram.com/oauth/authorize with native Instagram login UI and optional FB login button.
 */
export function openInstagramBusinessLoginPopup({ appId = DEFAULT_INSTAGRAM_APP_ID } = {}) {
  const targetAppId = appId || DEFAULT_INSTAGRAM_APP_ID;
  const redirectUri = encodeURIComponent(`${window.location.origin}/instagram-callback.html`);
  const scopes = encodeURIComponent(
    'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments'
  );

  // Official Instagram Business Login URL with fallback to Facebook Login enabled
  const oauthUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=1&force_authentication=1&client_id=${targetAppId}&redirect_uri=${redirectUri}&response_type=code&scope=${scopes}`;

  const width = 650;
  const height = 750;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  const popup = window.open(
    oauthUrl,
    'InstagramBusinessLogin',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
  );

  if (!popup) {
    const err = new Error('Popup blocked by browser. Please allow popups or use Direct Token connect.');
    err.code = 'POPUP_BLOCKED';
    return Promise.reject(err);
  }

  return new Promise((resolve, reject) => {
    let resolved = false;

    function handleMessage(event) {
      if (event.data?.type === 'IG_OAUTH_SUCCESS') {
        resolved = true;
        window.removeEventListener('message', handleMessage);
        resolve({
          accessToken: event.data.accessToken || null,
          code: event.data.code || null,
          status: 'connected',
        });
      } else if (event.data?.type === 'IG_OAUTH_ERROR') {
        resolved = true;
        window.removeEventListener('message', handleMessage);
        const err = new Error(event.data.error || 'Instagram authorization was cancelled.');
        err.code = 'USER_CANCELLED';
        reject(err);
      }
    }

    window.addEventListener('message', handleMessage);

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', handleMessage);
        setTimeout(() => {
          if (!resolved) {
            const err = new Error('Instagram Login popup was closed.');
            err.code = 'USER_CANCELLED';
            reject(err);
          }
        }, 500);
      }
    }, 600);
  });
}

/**
 * Launch Meta Instagram Professional Account Connect Dialog
 * 1. Attempts official Meta JS SDK FB.login (bypasses URL redirect strict mismatch).
 * 2. Falls back to direct OAuth popup window if SDK is blocked.
 */
export async function launchInstagramConnect({ appId = DEFAULT_APP_ID, forceNative = false } = {}) {
  if (forceNative) {
    return openInstagramBusinessLoginPopup({ appId });
  }

  const fb = await waitForMetaSdk(appId, 2500);
  if (fb && typeof fb.login === 'function') {
    return new Promise((resolve, reject) => {
      try {
        fb.login(
          function (response) {
            if (response && response.authResponse?.accessToken) {
              resolve({
                accessToken: response.authResponse.accessToken,
                status: 'connected',
              });
            } else {
              const err = new Error('Facebook Login was cancelled or incomplete.');
              err.code = 'USER_CANCELLED';
              reject(err);
            }
          },
          {
            scope:
              'pages_show_list,pages_read_engagement,pages_manage_metadata,instagram_basic,instagram_manage_messages,instagram_manage_comments',
            return_scopes: true,
            auth_type: 'rerequest',
          }
        );
      } catch (err) {
        console.warn('[Meta SDK] fb.login error, trying popup dialog:', err);
        openMetaOAuthDialog({ appId }).then(resolve).catch(reject);
      }
    });
  }

  return openMetaOAuthDialog({ appId });
}
