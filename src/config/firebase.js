import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoPlaceholderKeyForFirebase2026',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'arco-communication.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'arco-communication',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'arco-communication.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1029384756',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1029384756:web:abcdef123456',
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// Configure language
auth.useDeviceLanguage();

/**
 * Sets up RecaptchaVerifier on a DOM element container
 */
export function setupRecaptcha(containerId = 'recaptcha-container') {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      containerId,
      {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved - allow signInWithPhoneNumber
        },
        'expired-callback': () => {
          console.warn('[Recaptcha] Expired, resetting...');
          if (window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = null;
          }
        },
      }
    );
  }
  return window.recaptchaVerifier;
}

/**
 * Clears Recaptcha instance
 */
export function clearRecaptcha() {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear();
    } catch (e) {
      console.warn('[Recaptcha clear error]:', e);
    }
    window.recaptchaVerifier = null;
  }
}

/**
 * Initiates phone sign-in by sending OTP SMS via Firebase
 */
export async function sendFirebasePhoneOtp(phoneNumber, appVerifier) {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return { success: true, confirmationResult };
  } catch (error) {
    console.error('[Firebase Phone Auth Error]:', error);
    clearRecaptcha();
    throw error;
  }
}

/**
 * Confirms OTP code and returns authoritative Firebase ID token
 */
export async function confirmFirebaseOtp(confirmationResult, otpCode) {
  try {
    const userCredential = await confirmationResult.confirm(otpCode);
    const user = userCredential.user;
    const idToken = await user.getIdToken();
    return {
      success: true,
      user,
      idToken,
      uid: user.uid,
      phoneNumber: user.phoneNumber,
    };
  } catch (error) {
    console.error('[Firebase OTP Confirm Error]:', error);
    throw error;
  }
}
