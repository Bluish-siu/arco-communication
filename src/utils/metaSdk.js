/**
 * Meta WhatsApp Embedded Signup SDK Helper
 * Loads the official Meta (Facebook) JavaScript SDK v22.0 and manages
 * the Embedded Signup login popup dialog for multi-tenant client onboarding.
 */

const DEFAULT_APP_ID = '2872862256446175';
const DEFAULT_CONFIG_ID = '1131178462664882';

export function initMetaSdk(appId = DEFAULT_APP_ID) {
  if (typeof window === 'undefined') return;

  if (!window.FB) {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: appId || DEFAULT_APP_ID,
        autoLogAppEvents: true,
        cookie: true,
        xfbml: true,
        version: 'v22.0',
      });
    };

    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
    }
  }

  // Setup Global message listener for Embedded Signup postMessage payloads
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
 * Launch Meta Embedded Signup Popup (Same popup as Interakt)
 */
export function launchMetaEmbeddedSignup({
  appId = DEFAULT_APP_ID,
  configId = DEFAULT_CONFIG_ID,
  numberType = 'wa_business',
}) {
  return new Promise((resolve, reject) => {
    initMetaSdk(appId);

    // Fallback if FB SDK blocked by browser ad blocker
    if (!window.FB) {
      const hostedUrl = `https://business.facebook.com/messaging/whatsapp/onboard/?app_id=${appId}&config_id=${configId}`;
      const win = window.open(hostedUrl, '_blank', 'width=750,height=800');
      if (!win) {
        return reject(new Error('Popup blocked by browser. Please allow popups for this site.'));
      }
      return resolve({
        isHostedFallback: true,
        message: 'Opened Meta Onboarding dialog in separate window.',
      });
    }

    try {
      window.FB.login(
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
