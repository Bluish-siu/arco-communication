import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { db, query } from '../config/db.js';
import { config } from '../config/index.js';
import { verifyFirebaseIdToken } from '../config/firebaseAdmin.js';
import { metaWhatsAppService, formatPhoneNumber } from '../services/metaWhatsAppService.js';

export const authController = {
  // POST /api/auth/whatsapp/send-otp
  sendWhatsAppOtp: async (req, res, next) => {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ success: false, error: 'Mobile phone number is required' });
      }

      const cleanPhone = formatPhoneNumber(phone);
      if (!cleanPhone || cleanPhone.length < 8) {
        return res.status(400).json({ success: false, error: 'Please enter a valid mobile number with country code' });
      }

      // Generate 6-digit random OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
      const otpId = `otp_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

      // Invalidate any previous unused OTP for this phone number
      await query(
        "UPDATE auth_otps SET is_used = true, updated_at = CURRENT_TIMESTAMP WHERE phone = $1 AND is_used = false",
        [cleanPhone]
      );

      // Store new OTP
      await query(
        "INSERT INTO auth_otps (id, phone, otp_code, expires_at, attempts, is_used, created_at, updated_at) VALUES ($1, $2, $3, $4, 0, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
        [otpId, cleanPhone, otpCode, expiresAt]
      );

      // Dispatch approved Meta Authentication Template (arco_auth_otp) with Copy Code button
      const waRes = await metaWhatsAppService.sendTemplateMessage({
        to: cleanPhone,
        templateName: 'arco_auth_otp',
        languageCode: 'en_US',
        components: [
          {
            type: 'body',
            parameters: [{ type: 'text', text: otpCode }]
          },
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [{ type: 'text', text: otpCode }]
          }
        ]
      });

      if (!waRes?.success) {
        console.error('[WhatsApp OTP Dispatch Failed]:', waRes?.error || waRes?.message);
        return res.status(500).json({
          success: false,
          error: waRes?.error || 'Failed to dispatch WhatsApp verification code. Please check your number.'
        });
      }

      console.log(`[WhatsApp OTP Dispatched] Phone: ${cleanPhone} | WAMID: ${waRes.wamid || waRes.metaMessageId}`);

      return res.json({
        success: true,
        message: 'Verification code sent to your WhatsApp successfully!',
        data: {
          phone: cleanPhone,
          expiresInSeconds: 300,
        }
      });
    } catch (error) {
      console.error('[WhatsApp Send OTP Exception]:', error);
      next(error);
    }
  },

  // POST /api/auth/whatsapp/verify-otp
  verifyWhatsAppOtp: async (req, res, next) => {
    try {
      const { phone, otp } = req.body;
      if (!phone || !otp) {
        return res.status(400).json({ success: false, error: 'Phone number and verification code are required' });
      }

      const cleanPhone = formatPhoneNumber(phone);
      const cleanOtp = String(otp || '').trim().replace(/\D/g, '');

      if (!cleanPhone || cleanOtp.length !== 6) {
        return res.status(400).json({ success: false, error: 'Please enter a valid 6-digit verification code' });
      }

      // Query active OTP
      const otpRes = await query(
        "SELECT * FROM auth_otps WHERE phone = $1 AND is_used = false AND expires_at > CURRENT_TIMESTAMP ORDER BY created_at DESC LIMIT 1",
        [cleanPhone]
      );

      if (otpRes.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Verification code has expired or was not requested. Please request a new code.'
        });
      }

      const record = otpRes.rows[0];

      // Check max attempts
      if (record.attempts >= 5) {
        await query("UPDATE auth_otps SET is_used = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1", [record.id]);
        return res.status(429).json({
          success: false,
          error: 'Too many incorrect attempts. Please request a new verification code.'
        });
      }

      // Verify matching code
      if (record.otp_code !== cleanOtp) {
        await query("UPDATE auth_otps SET attempts = attempts + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1", [record.id]);
        return res.status(400).json({
          success: false,
          error: 'Incorrect verification code. Please check your WhatsApp and try again.'
        });
      }

      // Mark OTP as verified and used
      await query(
        "UPDATE auth_otps SET is_used = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [record.id]
      );

      // Find or create user in users table
      const raw10 = cleanPhone.slice(-10);
      let userRes = await query(
        "SELECT * FROM users WHERE phone = $1 OR phone = $2 OR phone LIKE $3 LIMIT 1",
        [cleanPhone, `+${cleanPhone}`, `%${raw10}`]
      );

      let user = userRes.rows[0];
      if (!user) {
        const newUserId = `usr_${Date.now()}`;
        const insertUser = await query(
          "INSERT INTO users (id, phone, name, company_name, role, trial_days_remaining, onboarding_completed, created_at, updated_at) VALUES ($1, $2, $3, $4, 'admin', 14, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *",
          [newUserId, `+${cleanPhone}`, `User ${raw10.slice(-4)}`, 'My ARCO Business']
        );
        user = insertUser.rows[0];
        console.log(`[USER CREATED WHATSAPP OTP] id = "${user.id}", phone = "${user.phone}"`);
      }

      // Generate JWT Token
      const token = jwt.sign(
        { id: user.id, phone: user.phone, email: user.email, role: user.role, name: user.name },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      let targetRoute = '/dashboard';
      if (!user.onboarding_completed) {
        targetRoute = '/onboarding';
      }

      return res.json({
        success: true,
        message: 'WhatsApp authentication successful',
        data: {
          user: {
            id: user.id,
            phone: user.phone,
            name: user.name,
            email: user.email,
            companyName: user.company_name,
            role: user.role,
            trialDaysRemaining: user.trial_days_remaining ?? 14,
            onboardingCompleted: user.onboarding_completed,
            business_setup: user.business_setup,
          },
          token,
          targetRoute,
        }
      });
    } catch (error) {
      console.error('[WhatsApp Verify OTP Exception]:', error);
      next(error);
    }
  },

  // POST /api/auth/phone
  loginWithPhone: async (req, res, next) => {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ success: false, error: 'Firebase ID token is required' });
      }

      // 1. Authoritatively verify Firebase ID token (Zero Trust for client-provided claims)
      const decoded = await verifyFirebaseIdToken(idToken);
      const uid = decoded.uid;
      const phoneNumber = decoded.phone_number;

      if (!uid) {
        return res.status(401).json({ success: false, error: 'Invalid or expired Firebase authentication token' });
      }

      console.log(`[FIREBASE PHONE AUTH] verified uid = "${uid}", phone = "${phoneNumber}"`);

      // 2. Find existing user with stable identity (by firebase_uid or phone)
      let user = null;
      if (uid) {
        user = await db.findOne('users', 'firebase_uid = $1', [uid]);
      }
      if (!user && phoneNumber) {
        user = await db.findOne('users', 'phone = $1', [phoneNumber]);
        if (user && uid && !user.firebase_uid) {
          // Link Firebase UID to existing phone record
          await db.update('users', user.id, { firebase_uid: uid });
          user.firebase_uid = uid;
        }
      }

      // 3. Create user if new
      if (user) {
        console.log(`[USER LOOKUP FOUND] id = "${user.id}", phone = "${user.phone}", firebase_uid = "${user.firebase_uid}", onboarding_completed = ${user.onboarding_completed}`);
      } else {
        const lastDigits = phoneNumber ? phoneNumber.slice(-4) : 'User';
        user = await db.insert('users', {
          id: `usr_${Date.now()}`,
          firebase_uid: uid,
          phone: phoneNumber || null,
          email: null, // Keep null for phone-only accounts
          name: `User ${lastDigits}`,
          company_name: 'My ARCO Business',
          role: 'admin',
          trial_days_remaining: 14,
          onboarding_completed: false,
        });
        console.log(`[USER CREATED NEW PHONE] id = "${user.id}", phone = "${user.phone}", firebase_uid = "${user.firebase_uid}", onboarding_completed = false`);
      }

      // 4. Generate ARCO JWT session token
      const token = jwt.sign(
        { id: user.id, phone: user.phone, email: user.email, role: user.role, name: user.name, firebase_uid: user.firebase_uid },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      // Determine onboarding target route based on PostgreSQL state
      let targetRoute = '/onboarding';
      if (user.onboarding_completed) {
        targetRoute = '/dashboard';
      } else if (user.business_setup?.companyName && user.business_setup?.phone && user.business_setup?.companyLocation) {
        if (!user.industry_data?.industry || !user.industry_data?.subCategory) {
          targetRoute = '/onboarding/industry';
        } else if (!user.objectives || user.objectives.length === 0) {
          targetRoute = '/onboarding/objectives';
        } else if (!user.integrations || user.integrations.length === 0) {
          targetRoute = '/onboarding/integrations';
        } else if (!user.configuration || user.configuration.hasFacebookBM === null || user.configuration.hasFacebookBM === undefined) {
          targetRoute = '/onboarding/configuration';
        } else {
          targetRoute = '/dashboard';
        }
      }

      console.log(`[PHONE LOGIN ROUTE] user.id = "${user.id}", onboarding_completed = ${user.onboarding_completed} -> targetRoute = ${targetRoute}`);

      res.json({
        success: true,
        message: 'Phone authentication successful',
        data: {
          user: {
            id: user.id,
            firebaseUid: user.firebase_uid,
            phone: user.phone,
            name: user.name,
            email: user.email,
            companyName: user.company_name,
            role: user.role,
            trialDaysRemaining: user.trial_days_remaining,
            onboardingCompleted: user.onboarding_completed,
            business_setup: user.business_setup,
            industry_data: user.industry_data,
            objectives: user.objectives,
            integrations: user.integrations,
            configuration: user.configuration,
          },
          token,
          targetRoute,
        },
      });
    } catch (error) {
      console.error('[Phone Auth Error]:', error);
      res.status(500).json({ success: false, error: error.message || 'Phone authentication failed' });
    }
  },
  // POST /api/auth/demo-login (Authoritative instant demo session for testing / presentations)
  demoLogin: async (req, res, next) => {
    try {
      let user = await db.findOne('users', 'email = $1', ['dshraddha875@gmail.com']);
      if (!user) {
        user = await db.findOne('users', "role = 'admin'", []);
      }
      if (!user) {
        user = await db.findOne('users', "id LIKE 'usr_%'", []);
      }

      const effectiveUser = user || {
        id: 'usr_demo_admin',
        name: 'Shraddha',
        email: 'shraddha@arco.com',
        role: 'admin',
        company_name: 'ARCO Communication',
        onboarding_completed: true,
        trial_days_remaining: 14,
      };

      const token = jwt.sign(
        {
          id: effectiveUser.id,
          email: effectiveUser.email,
          role: effectiveUser.role || 'admin',
          name: effectiveUser.name,
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      return res.json({
        success: true,
        message: 'Demo login successful',
        data: {
          user: {
            id: effectiveUser.id,
            name: effectiveUser.name,
            email: effectiveUser.email,
            companyName: effectiveUser.company_name || 'ARCO Communication',
            role: effectiveUser.role || 'admin',
            trialDaysRemaining: effectiveUser.trial_days_remaining ?? 14,
            onboardingCompleted: true,
            business_setup: effectiveUser.business_setup || {
              companyName: 'ARCO Communication',
              channel: 'Both',
            },
          },
          token,
          targetRoute: '/dashboard',
        },
      });
    } catch (error) {
      next(error);
    }
  },
  // POST /api/auth/register (New User Free Trial Registration)
  register: async (req, res, next) => {
    try {
      const {
        email,
        firstName,
        lastName,
        password,
        phone,
        companyName,
        companyWebsite,
        country,
        state,
        annualRevenue,
        channel,
        whatsappUpdates,
      } = req.body;

      if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, error: 'A valid email address is required' });
      }
      if (!firstName || !firstName.trim()) {
        return res.status(400).json({ success: false, error: 'First name is required' });
      }

      // If password provided, use it; otherwise generate secure auto-generated password
      const effectivePassword = password && password.length >= 6 ? password : crypto.randomBytes(8).toString('hex');
      const cleanEmail = email.trim().toLowerCase();
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(effectivePassword, salt, 1000, 64, 'sha512').toString('hex');
      const passwordHash = `${salt}:${hash}`;

      const businessSetupPayload = {
        channel: channel || 'Both',
        phone: phone || '',
        companyName: companyName ? companyName.trim() : 'My ARCO Business',
        companyWebsite: companyWebsite || '',
        country: country || 'India',
        state: state || '',
        annualRevenue: annualRevenue || '₹10L - ₹50L',
        whatsappUpdates: whatsappUpdates !== undefined ? !!whatsappUpdates : true,
      };

      // Check if user already exists
      let user = await db.findOne('users', 'LOWER(email) = LOWER($1)', [cleanEmail]);
      if (user) {
        // If user already exists, update business setup
        const updates = {
          company_name: companyName ? companyName.trim() : user.company_name,
          phone: phone || user.phone,
          business_setup: { ...(user.business_setup || {}), ...businessSetupPayload },
        };
        if (!user.password_hash) {
          updates.password_hash = passwordHash;
        }
        user = await db.update('users', user.id, updates);
      } else {
        const newUserId = `usr_${Date.now()}`;
        const fullName = `${firstName.trim()} ${(lastName || '').trim()}`.trim();
        try {
          const insertRes = await query(
            "INSERT INTO users (id, name, email, password_hash, company_name, phone, role, trial_days_remaining, onboarding_completed, business_setup, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, 'admin', 14, false, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *",
            [newUserId, fullName, cleanEmail, passwordHash, companyName ? companyName.trim() : 'My ARCO Business', phone || null, JSON.stringify(businessSetupPayload)]
          );
          user = insertRes.rows[0];
        } catch (dbErr) {
          // Fallback if schema doesn't yet have business_setup column
          const insertRes = await query(
            "INSERT INTO users (id, name, email, company_name, phone, role, trial_days_remaining, onboarding_completed, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, 'admin', 14, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *",
            [newUserId, fullName, cleanEmail, companyName ? companyName.trim() : 'My ARCO Business', phone || null]
          );
          user = insertRes.rows[0];
        }
      }

      // Generate JWT Token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role || 'admin', name: user.name, phone: user.phone },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      let targetRoute = '/onboarding/industry';
      if (user.onboarding_completed) {
        targetRoute = '/dashboard';
      }

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            companyName: user.company_name,
            role: user.role,
            trialDaysRemaining: user.trial_days_remaining ?? 14,
            onboardingCompleted: user.onboarding_completed,
            business_setup: user.business_setup || businessSetupPayload,
          },
          token,
          targetRoute,
        },
      });
    } catch (error) {
      console.error('[Register Exception]:', error);
      next(error);
    }
  },

  // POST /api/auth/login
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!password) {
        // Passwordless email login is strictly disabled for security.
        return res.status(401).json({
          success: false,
          error: 'Passwordless email login is disabled for security. Please sign in using Google Sign-In, Phone OTP, or enter your password.',
        });
      }

      if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, error: 'A valid email is required' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const user = await db.findOne('users', 'LOWER(email) = LOWER($1)', [cleanEmail]);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      // If user has password_hash, verify
      if (user.password_hash && user.password_hash.includes(':')) {
        const [salt, originalHash] = user.password_hash.split(':');
        const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        if (checkHash !== originalHash) {
          return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role || 'admin', name: user.name },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      let targetRoute = user.onboarding_completed ? '/dashboard' : '/onboarding';

      return res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            companyName: user.company_name,
            role: user.role,
            trialDaysRemaining: user.trial_days_remaining ?? 14,
            onboardingCompleted: user.onboarding_completed,
            business_setup: user.business_setup,
          },
          token,
          targetRoute,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // =========================================================================
  // REAL GOOGLE OAUTH 2.0 / OPENID CONNECT ENDPOINTS
  // =========================================================================

  // GET /api/auth/google/url & GET /api/auth/google
  getGoogleAuthUrl: async (req, res, next) => {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID || 'your_google_client_id_here';
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback';
      const state = crypto.randomBytes(16).toString('hex');
      const isConfigured = !!(clientId && clientId !== 'your_google_client_id_here');

      // Real Google OAuth 2.0 Authorization URL with prompt=select_account for multi-account selection
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&prompt=select_account&state=${state}&access_type=offline`;

      // If user directly navigated to /api/auth/google in browser
      if (req.path === '/google' || req.path === '/google/') {
        return res.redirect(authUrl);
      }

      res.json({
        success: true,
        data: {
          authUrl,
          state,
          isConfigured,
          clientId,
          redirectUri,
          message: isConfigured ? 'Google OAuth configured' : 'Using default/configured GOOGLE_CLIENT_ID',
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/auth/google/callback & POST /api/auth/google/callback
  handleGoogleCallback: async (req, res, next) => {
    try {
      const code = req.query.code || req.body.code;
      const state = req.query.state || req.body.state;
      const oauthError = req.query.error || req.body.error;

      // Handle OAuth error or user cancellation from Google
      if (oauthError) {
        console.warn('[Google OAuth Callback Error]:', oauthError);
        if (req.method === 'GET') {
          return res.redirect(`http://localhost:5173/login?error=${encodeURIComponent('Google sign-in was cancelled or denied: ' + oauthError)}`);
        }
        return res.status(400).json({
          success: false,
          error: `Google sign-in was cancelled or denied: ${oauthError}`,
        });
      }

      if (!code) {
        if (req.method === 'GET') {
          return res.redirect(`http://localhost:5173/login?error=${encodeURIComponent('Authorization code missing from Google callback')}`);
        }
        return res.status(400).json({ success: false, error: 'Authorization code is required' });
      }

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback';

      if (!clientId || clientId === 'your_google_client_id_here' || !clientSecret || clientSecret === 'your_google_client_secret_here') {
        const errorMsg = 'Google OAuth credentials (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) are missing or set to placeholder in .env';
        if (req.method === 'GET') {
          return res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(errorMsg)}`);
        }
        return res.status(400).json({ success: false, error: errorMsg });
      }

      // 1. Exchange authorization code for tokens with Google
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        console.error('[Google Token Exchange Error]:', tokenData);
        const errorMsg = tokenData.error_description || tokenData.error;
        if (req.method === 'GET') {
          return res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(errorMsg)}`);
        }
        return res.status(400).json({ success: false, error: errorMsg });
      }

      const { access_token } = tokenData;

      // 2. Fetch authenticated user profile from Google UserInfo endpoint
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const googleUser = await userInfoResponse.json();

      if (!googleUser.email) {
        const errorMsg = 'Google authentication succeeded but no email address was returned';
        if (req.method === 'GET') {
          return res.redirect(`http://localhost:5173/login?error=${encodeURIComponent(errorMsg)}`);
        }
        return res.status(400).json({ success: false, error: errorMsg });
      }

      const email = googleUser.email.trim();
      const name = googleUser.name || googleUser.given_name || email.split('@')[0];
      const googleSub = googleUser.sub;
      const avatarUrl = googleUser.picture || null;

      console.log(`[GOOGLE CALLBACK] google.sub = ${googleSub}, email = ${email}, name = ${name}`);

      // 3. Find existing user with stable identity (by google_id or email)
      let user = null;
      if (googleSub) {
        user = await db.findOne('users', 'google_id = $1', [googleSub]);
      }
      if (!user) {
        user = await db.findOne('users', 'LOWER(email) = LOWER($1)', [email]);
        if (user && googleSub && !user.google_id) {
          // Link Google sub identifier to existing account
          await db.update('users', user.id, {
            google_id: googleSub,
            avatar_url: avatarUrl || user.avatar_url,
          });
          user.google_id = googleSub;
        }
      }

      if (user) {
        console.log(`[USER LOOKUP FOUND] id = ${user.id}, email = ${user.email}, google_id = ${user.google_id}, onboarding_completed = ${user.onboarding_completed}`);
      } else {
        // If user does not exist, create new user with onboarding_completed = false
        user = await db.insert('users', {
          id: `usr_${Date.now()}`,
          google_id: googleSub,
          name,
          email,
          company_name: `${name}'s Business`,
          role: 'admin',
          trial_days_remaining: 14,
          onboarding_completed: false,
          avatar_url: avatarUrl,
        });
        console.log(`[USER CREATED NEW] id = ${user.id}, email = ${user.email}, google_id = ${user.google_id}, onboarding_completed = false`);
      }

      // 4. Generate ARCO JWT session token
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name, google_id: user.google_id },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
      );

      // Determine onboarding target route based on PostgreSQL state
      let targetRoute = '/onboarding';
      if (user.onboarding_completed) {
        targetRoute = '/dashboard';
      } else if (user.business_setup?.companyName && user.business_setup?.phone && user.business_setup?.companyLocation) {
        if (!user.industry_data?.industry || !user.industry_data?.subCategory) {
          targetRoute = '/onboarding/industry';
        } else if (!user.objectives || user.objectives.length === 0) {
          targetRoute = '/onboarding/objectives';
        } else if (!user.integrations || user.integrations.length === 0) {
          targetRoute = '/onboarding/integrations';
        } else if (!user.configuration || user.configuration.hasFacebookBM === null || user.configuration.hasFacebookBM === undefined) {
          targetRoute = '/onboarding/configuration';
        } else {
          targetRoute = '/dashboard';
        }
      }

      console.log(`[GOOGLE LOGIN ROUTE] user.id = ${user.id}, onboarding_completed = ${user.onboarding_completed} -> targetRoute = ${targetRoute}`);

      // If GET request from browser redirect
      if (req.method === 'GET') {
        return res.redirect(
          `http://localhost:5173/auth/google/callback?token=${token}&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name)}&id=${encodeURIComponent(user.id)}&onboardingCompleted=${user.onboarding_completed}&target=${encodeURIComponent(targetRoute)}`
        );
      }

      // If POST request from frontend callback component
      res.json({
        success: true,
        message: 'Google authentication successful',
        data: {
          user: {
            id: user.id,
            googleId: user.google_id,
            name: user.name,
            email: user.email,
            companyName: user.company_name,
            role: user.role,
            trialDaysRemaining: user.trial_days_remaining,
            onboardingCompleted: user.onboarding_completed,
            business_setup: user.business_setup,
            industry_data: user.industry_data,
            objectives: user.objectives,
            integrations: user.integrations,
            configuration: user.configuration,
          },
          targetRoute,
          token,
        },
      });
    } catch (error) {
      console.error('[GOOGLE CALLBACK EXCEPTION]:', error);
      next(error);
    }
  },

  // GET /api/auth/me
  getCurrentUser: async (req, res, next) => {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;

      let user = null;
      if (userId) {
        user = await db.findOne('users', 'id = $1', [userId]);
      }
      if (!user && userEmail) {
        user = await db.findOne('users', 'LOWER(email) = LOWER($1)', [userEmail.trim()]);
      }

      if (!user) {
        console.warn(`[AUTH ME WARNING] User not found for id: ${userId}, email: ${userEmail}`);
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      console.log(`[AUTH ME SUCCESS] id = ${user.id}, email = ${user.email}, google_id = ${user.google_id}, onboarding_completed = ${user.onboarding_completed}`);

      res.json({
        success: true,
        data: {
          id: user.id,
          googleId: user.google_id,
          name: user.name,
          email: user.email,
          companyName: user.company_name,
          phone: user.phone,
          industry: user.industry,
          role: user.role,
          trialDaysRemaining: user.trial_days_remaining,
          onboardingCompleted: user.onboarding_completed,
          business_setup: user.business_setup,
          industry_data: user.industry_data,
          objectives: user.objectives,
          integrations: user.integrations,
          configuration: user.configuration,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/onboarding
  updateOnboarding: async (req, res, next) => {
    try {
      const { businessSetup, industryData, objectives, integrations, configuration, isCompleted } = req.body;
      const userId = req.user?.id;
      const userEmail = req.user?.email;

      console.log(`[ONBOARDING SAVE ATTEMPT] req.user.id = ${userId}, req.user.email = ${userEmail}, isCompleted = ${isCompleted}`);

      let user = null;
      if (userId) {
        user = await db.findOne('users', 'id = $1', [userId]);
      }
      if (!user && userEmail) {
        user = await db.findOne('users', 'LOWER(email) = LOWER($1)', [userEmail.trim()]);
      }

      if (!user) {
        console.error(`[ONBOARDING SAVE ERROR] User not found for id: ${userId}, email: ${userEmail}`);
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const updateData = {
        company_name: businessSetup?.companyName || user.company_name,
        phone: businessSetup?.phone || user.phone,
        industry: industryData?.industry || user.industry,
        business_setup: businessSetup ? businessSetup : user.business_setup,
        industry_data: industryData ? industryData : user.industry_data,
        objectives: objectives ? objectives : user.objectives,
        integrations: integrations ? integrations : user.integrations,
        configuration: configuration ? configuration : user.configuration,
        onboarding_completed: isCompleted !== undefined ? !!isCompleted : true,
      };

      const updated = await db.update('users', user.id, updateData);

      console.log(`[ONBOARDING SAVE SUCCESS] user.id = ${updated.id}, email = ${updated.email}, google_id = ${updated.google_id}, onboarding_completed = ${updated.onboarding_completed}, company = "${updated.company_name}"`);

      return res.json({
        success: true,
        message: 'Onboarding updated successfully in PostgreSQL database',
        data: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          googleId: updated.google_id,
          companyName: updated.company_name,
          phone: updated.phone,
          industry: updated.industry,
          role: updated.role,
          trialDaysRemaining: updated.trial_days_remaining,
          onboardingCompleted: updated.onboarding_completed,
          business_setup: updated.business_setup,
          industry_data: updated.industry_data,
          objectives: updated.objectives,
          integrations: updated.integrations,
          configuration: updated.configuration,
        },
      });
    } catch (error) {
      console.error('[ONBOARDING SAVE EXCEPTION]:', error);
      next(error);
    }
  },
};
