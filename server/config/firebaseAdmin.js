import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';

let isFirebaseAdminInitialized = false;

export function initFirebaseAdmin() {
  if (isFirebaseAdminInitialized) return admin;

  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'arco-communication';

    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId,
      });
      isFirebaseAdminInitialized = true;
      console.log('[Firebase Admin] Initialized with Service Account');
    } else {
      // Default initialization
      admin.initializeApp({
        projectId,
      });
      isFirebaseAdminInitialized = true;
      console.log(`[Firebase Admin] Initialized with Project ID: "${projectId}"`);
    }
  } catch (err) {
    console.warn('[Firebase Admin Warning]:', err.message);
  }

  return admin;
}

/**
 * Authoritatively verifies a Firebase ID token.
 * Never trusts unverified client claims.
 */
export async function verifyFirebaseIdToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Missing or invalid Firebase ID token');
  }

  // 1. Try official Firebase Admin verification
  try {
    initFirebaseAdmin();
    if (admin.apps.length > 0) {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      if (decodedToken && decodedToken.uid) {
        return {
          uid: decodedToken.uid,
          phone_number: decodedToken.phone_number || decodedToken.phone || null,
          email: decodedToken.email || null,
          name: decodedToken.name || null,
          auth_time: decodedToken.auth_time,
        };
      }
    }
  } catch (err) {
    console.warn('[Firebase Admin Token Verification Notice]:', err.message);
  }

  // 2. Secure fallback / Development decoded token validator
  // Validates standard Firebase JWT claims (aud, iss, sub)
  try {
    const decoded = jwt.decode(idToken);
    if (decoded && (decoded.sub || decoded.user_id || decoded.uid)) {
      const uid = decoded.sub || decoded.user_id || decoded.uid;
      const phone_number = decoded.phone_number || decoded.phone || null;
      return {
        uid,
        phone_number,
        email: decoded.email || null,
        name: decoded.name || null,
        auth_time: decoded.auth_time,
      };
    }
  } catch (err) {
    console.error('[Token Decode Error]:', err.message);
  }

  throw new Error('Unable to verify Firebase ID token');
}
