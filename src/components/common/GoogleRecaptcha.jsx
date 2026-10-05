import { useEffect, useRef, useState } from 'react';

// Google Official Test Key that always passes without domain restrictions
const GOOGLE_TEST_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

/**
 * GoogleRecaptcha Component
 * Loads authentic Google reCAPTCHA v2 widget.
 * Uses VITE_RECAPTCHA_SITE_KEY from environment or falls back to Google's official test key.
 */
export default function GoogleRecaptcha({
  onVerify,
  onExpire,
  onError,
  siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || GOOGLE_TEST_SITE_KEY,
  className = '',
}) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Check if script is already present
    const existingScript = document.querySelector('script[src*="recaptcha/api.js"]');

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.grecaptcha?.render) return;

      // Don't render again if already rendered in this container
      if (containerRef.current.innerHTML.trim() !== '') return;

      try {
        const id = window.grecaptcha.render(containerRef.current, {
          sitekey: siteKey,
          theme: 'light',
          size: 'normal',
          callback: (token) => {
            if (isMounted && onVerify) onVerify(token);
          },
          'expired-callback': () => {
            if (isMounted && onExpire) onExpire();
          },
          'error-callback': () => {
            if (isMounted && onError) onError();
          },
        });
        widgetIdRef.current = id;
        setIsLoaded(true);
      } catch (err) {
        console.warn('[GoogleRecaptcha] render warning:', err);
      }
    };

    if (window.grecaptcha && window.grecaptcha.render) {
      renderWidget();
    } else {
      // Define global callback if not yet defined
      window.__arcoRecaptchaLoaded = () => {
        if (isMounted) renderWidget();
      };

      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://www.google.com/recaptcha/api.js?onload=__arcoRecaptchaLoaded&render=explicit';
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          console.error('[GoogleRecaptcha] Failed to load Google reCAPTCHA script.');
          if (onError) onError();
        };
        document.head.appendChild(script);
      } else {
        // Poll for grecaptcha readiness
        const checkInterval = setInterval(() => {
          if (window.grecaptcha && window.grecaptcha.render) {
            clearInterval(checkInterval);
            renderWidget();
          }
        }, 100);

        return () => clearInterval(checkInterval);
      }
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current !== null && window.grecaptcha?.reset) {
        try {
          window.grecaptcha.reset(widgetIdRef.current);
        } catch {
          // Ignore reset error on unmount
        }
      }
    };
  }, [siteKey, onVerify, onExpire, onError]);

  return (
    <div className={`recaptcha-wrapper min-h-[78px] flex items-center ${className}`}>
      <div ref={containerRef} id="arco-google-recaptcha" className="overflow-hidden rounded-md" />
      {!isLoaded && (
        <div className="w-[304px] h-[78px] bg-slate-50 border border-slate-300 rounded-md flex items-center justify-center text-xs text-slate-400 font-medium">
          Loading reCAPTCHA...
        </div>
      )}
    </div>
  );
}
