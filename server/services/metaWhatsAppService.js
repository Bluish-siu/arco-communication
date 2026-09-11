import crypto from 'crypto';
import { query } from '../config/db.js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'arco_aes256_secret_key_32_bytes_len!';
const IV_LENGTH = 16;

// Helper to encrypt sensitive tokens server-side
export function encryptToken(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest();
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Helper to decrypt sensitive tokens server-side
export function decryptToken(encryptedText) {
  if (!encryptedText || !encryptedText.includes(':')) return null;
  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = Buffer.from(parts[1], 'hex');
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    console.warn('[metaWhatsAppService] Failed to decrypt token:', err.message);
    return null;
  }
}

// Clean phone number to E.164 without leading '+'
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  const str = String(phone).trim();
  // Corrupted spreadsheet scientific notation protection (e.g. 9.19748E+11)
  if (/[eE][+-]?\d+/.test(str)) {
    return '';
  }
  // Remove all non-digit characters
  let digits = str.replace(/\D/g, '');
  // If Indian number without country code (10 digits starting with 6, 7, 8, 9), prefix 91
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    digits = `91${digits}`;
  }
  return digits;
}

// Robust recipient phone normalizer supporting full phone or phone + country code
export function normalizeRecipientPhone({ fullPhone, phone, countryCode } = {}) {
  const cleanFull = fullPhone ? String(fullPhone).trim() : '';
  const cleanPhone = phone ? String(phone).trim() : '';
  const cleanCc = countryCode ? String(countryCode).replace(/\D/g, '') : '';

  // Scientific notation protection (e.g. 9.19748E+11)
  if (/[eE][+-]?\d+/.test(cleanFull) || /[eE][+-]?\d+/.test(cleanPhone)) {
    return {
      isValid: false,
      error: `Invalid phone number format: corrupted by spreadsheet scientific notation ("${cleanFull || cleanPhone}"). Please format phone column as plain text in your CSV.`,
    };
  }

  // 1. Prefer Full Phone Number if provided
  if (cleanFull) {
    const digits = cleanFull.replace(/\D/g, '');
    if (digits.length >= 9 && digits.length <= 15) {
      return {
        isValid: true,
        normalizedPhone: digits,
        formattedDisplay: `+${digits}`,
      };
    }
  }

  // 2. Phone + Country Code
  if (cleanPhone) {
    let digits = cleanPhone.replace(/\D/g, '');
    if (cleanCc) {
      if (digits.startsWith(cleanCc) && digits.length >= cleanCc.length + 8) {
        // Country code is already included
        return {
          isValid: true,
          normalizedPhone: digits,
          formattedDisplay: `+${digits}`,
        };
      }
      const combined = `${cleanCc}${digits}`;
      if (combined.length >= 9 && combined.length <= 15) {
        return {
          isValid: true,
          normalizedPhone: combined,
          formattedDisplay: `+${combined}`,
        };
      }
    }

    // Default 10-digit Indian phone normalization
    if (digits.length === 10 && /^[6-9]/.test(digits)) {
      return {
        isValid: true,
        normalizedPhone: `91${digits}`,
        formattedDisplay: `+91 ${digits}`,
      };
    }

    if (digits.length >= 9 && digits.length <= 15) {
      return {
        isValid: true,
        normalizedPhone: digits,
        formattedDisplay: `+${digits}`,
      };
    }
  }

  return {
    isValid: false,
    normalizedPhone: cleanFull || cleanPhone || '',
    reason: 'Invalid or missing phone number (must be 9-15 digits with valid country code)',
  };
}

// WhatsApp Opt-In Helper
export function isWhatsAppOpted(val) {
  if (val === true) return true;
  if (val === false || val === null || val === undefined) return false;
  const str = String(val).trim().toLowerCase();
  return ['true', '1', 'yes', 'y', 'opted', 'opt-in', 'opted-in'].includes(str);
}

// 24-Hour WhatsApp Session Window Helper
export function isWithin24HourWindow(lastInboundAt) {
  if (!lastInboundAt) return false;
  const inboundTime = new Date(lastInboundAt).getTime();
  if (isNaN(inboundTime)) return false;
  return Date.now() - inboundTime <= 24 * 60 * 60 * 1000;
}

export const metaWhatsAppService = {
  // 1. Resolve Meta WhatsApp Cloud API credentials
  getCredentials: async () => {
    // Check environment variables first
    const envToken = process.env.META_ACCESS_TOKEN || process.env.META_WHATSAPP_TOKEN || process.env.WHATSAPP_TOKEN;
    const envPhoneId = process.env.META_PHONE_NUMBER_ID || process.env.META_WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
    const envWabaId = process.env.META_WABA_ID || process.env.META_BUSINESS_ACCOUNT_ID || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    const version = process.env.META_GRAPH_API_VERSION || 'v25.0';

    const isEnvConfigured = Boolean(
      envToken &&
      envToken !== 'your_meta_access_token_here' &&
      envPhoneId &&
      envPhoneId !== 'your_phone_number_id_here'
    );

    if (isEnvConfigured) {
      return {
        isConfigured: true,
        source: 'env',
        accessToken: envToken,
        phoneNumberId: envPhoneId,
        wabaId: envWabaId || null,
        displayPhoneNumber: process.env.META_DISPLAY_PHONE_NUMBER || '+91 98765 43210',
        version,
        missingFields: [],
      };
    }

    // Check PostgreSQL database meta_integrations table
    try {
      const res = await query(
        `SELECT id, meta_business_id, waba_id, phone_number_id, display_phone_number,
                access_token_encrypted, status
         FROM meta_integrations
         WHERE status = 'connected'
         ORDER BY updated_at DESC LIMIT 1`
      );

      if (res.rows.length > 0) {
        const row = res.rows[0];
        const decryptedToken = decryptToken(row.access_token_encrypted);
        const effectiveToken = decryptedToken || row.access_token_encrypted;

        const isDbConfigured = Boolean(
          effectiveToken &&
          effectiveToken !== 'meta_valid_token_session' &&
          row.phone_number_id
        );

        return {
          isConfigured: isDbConfigured,
          source: 'database',
          accessToken: effectiveToken,
          phoneNumberId: row.phone_number_id,
          wabaId: row.waba_id,
          displayPhoneNumber: row.display_phone_number,
          version,
          missingFields: isDbConfigured ? [] : ['access_token'],
        };
      }
    } catch (err) {
      console.warn('[metaWhatsAppService] Database lookup for credentials failed:', err.message);
    }

    const missingFields = [];
    if (!envToken || envToken === 'your_meta_access_token_here') missingFields.push('META_ACCESS_TOKEN');
    if (!envPhoneId || envPhoneId === 'your_phone_number_id_here') missingFields.push('META_PHONE_NUMBER_ID');

    return {
      isConfigured: false,
      source: 'none',
      accessToken: null,
      phoneNumberId: null,
      wabaId: null,
      displayPhoneNumber: null,
      version,
      missingFields,
    };
  },

  // 2. Verify connection with Meta Graph API
  verifyConnection: async () => {
    const creds = await metaWhatsAppService.getCredentials();
    if (!creds.isConfigured) {
      return {
        isConnected: false,
        reason: 'Credentials not configured in environment or database',
        missingFields: creds.missingFields,
        creds,
      };
    }

    try {
      const url = `https://graph.facebook.com/${creds.version}/${creds.phoneNumberId}?fields=id,verified_name,display_phone_number,quality_rating,code_verification_status`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        return {
          isConnected: false,
          error: data.error?.message || `Meta Graph API returned HTTP ${response.status}`,
          code: data.error?.code,
          subcode: data.error?.error_subcode,
          type: data.error?.type,
          creds,
        };
      }

      return {
        isConnected: true,
        phoneNumberId: data.id,
        verifiedName: data.verified_name || creds.displayPhoneNumber,
        displayPhoneNumber: data.display_phone_number || creds.displayPhoneNumber,
        qualityRating: data.quality_rating || 'GREEN (High)',
        codeVerificationStatus: data.code_verification_status || 'VERIFIED',
        creds,
      };
    } catch (err) {
      return {
        isConnected: false,
        error: `Network error reaching Meta Graph API: ${err.message}`,
        creds,
      };
    }
  },

  // 3. Send WhatsApp Template Message via Meta Cloud API
  sendTemplateMessage: async ({
    to,
    templateName,
    languageCode = 'en_US',
    components = [],
    variables = {},
    headerVariables = [],
    headerText,
    headerImageUrl,
    headerMediaUrl,
    buttonPayloads = [],
  }) => {
    if (!to) {
      return { success: false, error: 'Recipient phone number is required' };
    }
    if (!templateName) {
      return { success: false, error: 'Template name is required' };
    }

    const cleanTo = formatPhoneNumber(to);
    if (!cleanTo || cleanTo.length < 8) {
      return {
        success: false,
        error: `Invalid phone number format: "${to}". Must be a valid phone number with country code.`,
      };
    }

    const creds = await metaWhatsAppService.getCredentials();
    if (!creds.isConfigured) {
      return {
        success: false,
        error: 'META_CREDENTIALS_MISSING',
        message: 'WhatsApp Business API is not connected. Please configure your Meta credentials or connect your WhatsApp Business Account.',
        missingFields: creds.missingFields,
      };
    }

    // 1. Dynamically inspect Meta template definition from WABA
    let effectiveLanguage = languageCode || 'en';
    let resolvedHeaderImage = headerImageUrl || headerMediaUrl || null;
    let foundTmpl = null;

    try {
      const templatesRes = await metaWhatsAppService.getWhatsAppTemplates();
      foundTmpl = templatesRes.data?.find((t) => t.name === templateName) || templatesRes.approved?.find((t) => t.name === templateName);
      
      if (foundTmpl) {
        // Pre-check template review status with Meta (Requirement 8)
        const tmplStatus = (foundTmpl.status || '').toUpperCase();
        if (['PENDING', 'IN_PROGRESS', 'IN_REVIEW', 'IN-REVIEW', 'SUBMITTED'].includes(tmplStatus)) {
          console.log(`[Meta Cloud API Guard] Template "${templateName}" is currently ${tmplStatus}. Refusing to send before Meta approval.`);
          return {
            success: false,
            status: 'pending',
            isUnderReview: true,
            error: `Template "${templateName}" is currently under Meta review. Messaging will be enabled once Meta approves the template.`,
            message: `Template "${templateName}" is currently under Meta review. Messaging will be enabled once Meta approves the template.`,
            templateStatus: foundTmpl.status,
            templateName,
          };
        } else if (tmplStatus === 'REJECTED') {
          console.log(`[Meta Cloud API Guard] Template "${templateName}" is REJECTED.`);
          return {
            success: false,
            status: 'rejected',
            error: `Template "${templateName}" was rejected by Meta. Reason: ${foundTmpl.rejectedReason || 'Does not comply with Meta guidelines'}.`,
            message: `Template "${templateName}" was rejected by Meta.`,
            templateStatus: foundTmpl.status,
            templateName,
          };
        }

        // Auto-match approved language
        if (foundTmpl.language && foundTmpl.language !== effectiveLanguage) {
          console.log(`[Meta Cloud API] Auto-matched approved template language: "${foundTmpl.language}" for "${templateName}"`);
          effectiveLanguage = foundTmpl.language;
        }

        // Dynamically inspect HEADER component in current Meta template definition
        const headerComp = foundTmpl.components?.find((c) => c.type === 'HEADER');
        if (headerComp?.format === 'IMAGE' && !resolvedHeaderImage && headerComp.example?.header_handle?.[0]) {
          resolvedHeaderImage = headerComp.example.header_handle[0];
          console.log(`[Meta Cloud API] Auto-resolved IMAGE header handle for "${templateName}"`);
        }
      }
    } catch (e) {
      // Lookup failed - proceed with caution without crashing
    }

    // 2. Dynamically build components based on actual template definition
    let formattedComponents = Array.isArray(components) && components.length > 0 ? [...components] : [];

    if (formattedComponents.length === 0) {
      const headerComp = foundTmpl?.components?.find((c) => c.type === 'HEADER');

      // A. HEADER COMPONENT: Only construct header parameter if Meta template actually contains a HEADER
      if (headerComp) {
        if (headerComp.format === 'IMAGE' && resolvedHeaderImage) {
          formattedComponents.push({
            type: 'header',
            parameters: [
              {
                type: 'image',
                image: { link: resolvedHeaderImage },
              },
            ],
          });
        } else if (headerComp.format === 'VIDEO' && resolvedHeaderImage) {
          formattedComponents.push({
            type: 'header',
            parameters: [
              {
                type: 'video',
                video: { link: resolvedHeaderImage },
              },
            ],
          });
        } else if (headerComp.format === 'DOCUMENT' && resolvedHeaderImage) {
          formattedComponents.push({
            type: 'header',
            parameters: [
              {
                type: 'document',
                document: { link: resolvedHeaderImage },
              },
            ],
          });
        } else if (headerComp.format === 'TEXT' && Array.isArray(headerVariables) && headerVariables.length > 0) {
          formattedComponents.push({
            type: 'header',
            parameters: headerVariables.map((val) => ({
              type: 'text',
              text: String(val),
            })),
          });
        }
      }
      // If no HEADER component exists in foundTmpl, NO header parameter is attached!

      // B. BODY COMPONENT: Only add body parameters if variables are required/provided
      const bodyParams = [];
      if (Array.isArray(variables)) {
        variables.forEach((val) => {
          bodyParams.push({ type: 'text', text: String(val) });
        });
      } else if (typeof variables === 'object' && variables !== null) {
        const keys = Object.keys(variables).sort((a, b) => Number(a) - Number(b));
        keys.forEach((k) => {
          if (variables[k] !== undefined && variables[k] !== null && variables[k] !== '') {
            bodyParams.push({ type: 'text', text: String(variables[k]) });
          }
        });
      }

      if (bodyParams.length > 0) {
        formattedComponents.push({
          type: 'body',
          parameters: bodyParams,
        });
      }

      // C. BUTTONS COMPONENT: Only add parameters if dynamic URL or quick reply payload
      if (Array.isArray(buttonPayloads) && buttonPayloads.length > 0) {
        buttonPayloads.forEach((btn, idx) => {
          if (btn.type === 'url' && btn.parameter) {
            formattedComponents.push({
              type: 'button',
              sub_type: 'url',
              index: String(idx),
              parameters: [{ type: 'text', text: String(btn.parameter) }],
            });
          } else if (btn.type === 'quick_reply' && btn.payload) {
            formattedComponents.push({
              type: 'button',
              sub_type: 'quick_reply',
              index: String(idx),
              parameters: [{ type: 'payload', payload: String(btn.payload) }],
            });
          }
        });
      }
    }

    // 3. Construct Meta WhatsApp Cloud API payload
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo,
      type: 'template',
      template: {
        name: templateName,
        language: {
          code: effectiveLanguage,
        },
        ...(formattedComponents.length > 0 ? { components: formattedComponents } : {}),
      },
    };

    const headerType = formattedComponents.find((c) => c.type === 'header')?.parameters?.[0]?.type?.toUpperCase() || (foundTmpl?.components?.find((c) => c.type === 'HEADER')?.format || 'NONE');
    const url = `https://graph.facebook.com/${creds.version}/${creds.phoneNumberId}/messages`;

    try {
      // Diagnostic Log Entry for Outgoing Request (Requirement 16 - No tokens exposed)
      console.log(
        `[Meta Cloud API Outgoing Request] Phone Number ID: ${creds.phoneNumberId} | Recipient: +${cleanTo} | Template: "${templateName}" | Language: "${effectiveLanguage}" | Header Type: ${headerType} | Endpoint: ${url}`
      );

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        console.error('[Meta Cloud API Error Response]:', JSON.stringify({
          status: response.status,
          errorCode: data.error?.code,
          errorSubcode: data.error?.error_subcode,
          errorMessage: data.error?.message,
          errorType: data.error?.type,
          fbtraceId: data.error?.fbtrace_id,
        }));

        let customErrorMsg = data.error?.message || `Meta API HTTP ${response.status}`;
        if (data.error?.code === 132001) {
          try {
            const allTmplsRes = await metaWhatsAppService.getWhatsAppTemplates();
            const matchingTmpl = allTmplsRes.data?.find((t) => t.name === templateName);
            if (matchingTmpl && matchingTmpl.status === 'PENDING') {
              customErrorMsg = `Template "${templateName}" is currently PENDING review by Meta. Meta Cloud API only permits sending messages after the template status changes to APPROVED.`;
            } else {
              customErrorMsg = `WhatsApp template "${templateName}" not found or not yet approved for language "${effectiveLanguage}". Please select an approved template from your connected Meta WhatsApp Business account.`;
            }
          } catch (e) {
            customErrorMsg = `WhatsApp template "${templateName}" not found or not yet approved for language "${effectiveLanguage}". Please select an approved template from your connected Meta WhatsApp Business account.`;
          }
        } else if (data.error?.code === 190) {
          customErrorMsg = `Meta Access Token Session Expired (Error #190): ${data.error?.message || 'Please update META_ACCESS_TOKEN in .env'}`;
        } else if (data.error?.code === 131030) {
          customErrorMsg = `Recipient phone number (+${cleanTo}) is not in Meta Allowed Numbers list. In Development/Test mode, add this number in Meta App Dashboard > WhatsApp > API Setup > To phone number.`;
        }

        return {
          success: false,
          error: customErrorMsg,
          rawError: data.error?.message,
          errorCode: data.error?.code,
          errorSubcode: data.error?.error_subcode,
          errorType: data.error?.type,
          fbtraceId: data.error?.fbtrace_id,
          payload,
        };
      }

      const wamid = data.messages?.[0]?.id || `wamid_${Date.now()}`;
      const messageStatus = data.messages?.[0]?.message_status || 'accepted';

      // Diagnostic Log Entry for Successful Dispatch (Requirement 16)
      console.log(
        `[Meta Cloud API Outgoing Success] Phone Number ID: ${creds.phoneNumberId} | Recipient: +${cleanTo} | Template: "${templateName}" | Language: "${effectiveLanguage}" | Header Type: ${headerType} | WAMID: ${wamid} | Status: ${messageStatus}`
      );

      // Persist outbound dispatch in whatsapp_message_logs
      try {
        await query(
          `INSERT INTO whatsapp_message_logs (
             wamid, recipient_phone, template_name, template_language, sender_phone_id,
             status, raw_payload, raw_response, accepted_at, updated_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (wamid) DO UPDATE SET
             status = EXCLUDED.status,
             updated_at = CURRENT_TIMESTAMP`,
          [
            wamid,
            cleanTo,
            templateName,
            effectiveLanguage,
            creds.phoneNumberId,
            messageStatus,
            JSON.stringify(payload),
            JSON.stringify(data),
          ]
        );
      } catch (logErr) {
        console.warn('[metaWhatsAppService] Failed to record message in whatsapp_message_logs:', logErr.message);
      }

      return {
        success: true,
        wamid,
        metaMessageId: wamid,
        recipientPhone: cleanTo,
        templateName,
        templateLanguage: effectiveLanguage,
        senderPhoneId: creds.phoneNumberId,
        status: messageStatus,
        timestamp: new Date().toISOString(),
        metaResponse: data,
      };
    } catch (err) {
      console.error('[Meta Cloud API Fetch Exception]:', err.message);
      return {
        success: false,
        error: `Network connection failed: ${err.message}`,
      };
    }
  },

  // 4. Send Free-Form WhatsApp Text Message via Meta Cloud API (during 24-hour service window)
  sendTextMessage: async ({ to, text, previewUrl = false }) => {
    if (!to) {
      return { success: false, error: 'Recipient phone number is required' };
    }
    if (!text || !text.trim()) {
      return { success: false, error: 'Message text cannot be empty' };
    }

    const cleanTo = formatPhoneNumber(to);
    if (!cleanTo || cleanTo.length < 8) {
      return {
        success: false,
        error: `Invalid phone number format: "${to}". Must be a valid phone number with country code.`,
      };
    }

    const creds = await metaWhatsAppService.getCredentials();
    if (!creds.isConfigured) {
      return {
        success: false,
        error: 'META_CREDENTIALS_MISSING',
        message: 'WhatsApp Business API is not connected. Please configure your Meta credentials in environment variables.',
        missingFields: creds.missingFields,
      };
    }

    const url = `https://graph.facebook.com/${creds.version}/${creds.phoneNumberId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo,
      type: 'text',
      text: {
        preview_url: Boolean(previewUrl),
        body: text.trim(),
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        let customErrorMsg = data.error?.message || `Meta Cloud API error (HTTP ${response.status})`;
        if (data.error?.code === 131047 || data.error?.code === 131051) {
          customErrorMsg = 'The 24-hour WhatsApp customer service window has expired. A pre-approved template message is required to message this customer.';
        } else if (data.error?.code === 131030) {
          customErrorMsg = `Recipient phone (+${cleanTo}) is not in Meta Allowed Numbers list (Development mode).`;
        } else if (data.error?.code === 190) {
          customErrorMsg = 'Meta Access Token Session Expired (#190). Please verify META_ACCESS_TOKEN.';
        }

        console.warn(`[Meta Cloud API Send Text Failed]: ${customErrorMsg}`);
        return {
          success: false,
          error: customErrorMsg,
          rawError: data.error?.message,
          errorCode: data.error?.code,
          errorSubcode: data.error?.error_subcode,
          payload,
        };
      }

      const wamid = data.messages?.[0]?.id || `wamid_${Date.now()}`;
      const messageStatus = data.messages?.[0]?.message_status || 'accepted';

      console.log(
        `[Meta Cloud API Text Message Dispatched] Phone ID: ${creds.phoneNumberId} | Recipient: +${cleanTo} | WAMID: ${wamid}`
      );

      // Persist outbound dispatch in whatsapp_message_logs
      try {
        await query(
          `INSERT INTO whatsapp_message_logs (
             wamid, recipient_phone, template_name, sender_phone_id,
             status, raw_payload, raw_response, accepted_at, updated_at
           ) VALUES ($1, $2, 'free_form_text', $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (wamid) DO UPDATE SET
             status = EXCLUDED.status,
             updated_at = CURRENT_TIMESTAMP`,
          [
            wamid,
            cleanTo,
            creds.phoneNumberId,
            messageStatus,
            JSON.stringify(payload),
            JSON.stringify(data),
          ]
        );
      } catch (logErr) {
        console.warn('[metaWhatsAppService] Failed to record text message in whatsapp_message_logs:', logErr.message);
      }

      return {
        success: true,
        wamid,
        metaMessageId: wamid,
        recipientPhone: cleanTo,
        status: 'sent',
        timestamp: new Date().toISOString(),
        metaResponse: data,
      };
    } catch (err) {
      console.error('[Meta Cloud API Fetch Exception]:', err.message);
      return {
        success: false,
        error: `Network connection failed: ${err.message}`,
      };
    }
  },

  // 4b. Send Interactive List Message via Meta Cloud API (within 24-hour service window)
  sendInteractiveListMessage: async ({ to, headerText, bodyText, footerText, buttonText = 'Select an option', sections = [] }) => {
    if (!to) {
      return { success: false, error: 'Recipient phone number is required' };
    }
    if (!bodyText || !bodyText.trim()) {
      return { success: false, error: 'List body text cannot be empty' };
    }

    const cleanTo = formatPhoneNumber(to);
    if (!cleanTo || cleanTo.length < 8) {
      return {
        success: false,
        error: `Invalid phone number format: "${to}". Must be a valid phone number with country code.`,
      };
    }

    const creds = await metaWhatsAppService.getCredentials();
    if (!creds.isConfigured) {
      return {
        success: false,
        error: 'META_CREDENTIALS_MISSING',
        message: 'WhatsApp Business API is not connected. Please configure your Meta credentials in environment variables.',
        missingFields: creds.missingFields,
      };
    }

    const interactivePayload = {
      type: 'list',
      header: headerText ? { type: 'text', text: headerText.trim() } : undefined,
      body: { text: bodyText.trim() },
      footer: footerText ? { text: footerText.trim() } : undefined,
      action: {
        button: (buttonText || 'Select Option').trim().slice(0, 20),
        sections: sections.length > 0 ? sections : [
          {
            title: 'Options',
            rows: [
              { id: 'opt_1', title: 'Option 1', description: '' },
            ],
          },
        ],
      },
    };

    const url = `https://graph.facebook.com/${creds.version}/${creds.phoneNumberId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo,
      type: 'interactive',
      interactive: interactivePayload,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        let customErrorMsg = data.error?.message || `Meta Cloud API error (HTTP ${response.status})`;
        if (data.error?.code === 131047 || data.error?.code === 131051) {
          customErrorMsg = 'The 24-hour WhatsApp customer service window has expired. A pre-approved template message is required to message this customer.';
        }
        console.warn(`[Meta Cloud API Send Interactive List Failed]: ${customErrorMsg}`);
        return {
          success: false,
          error: customErrorMsg,
          rawError: data.error?.message,
          errorCode: data.error?.code,
          errorSubcode: data.error?.error_subcode,
          payload,
        };
      }

      const wamid = data.messages?.[0]?.id || `wamid_${Date.now()}`;
      const messageStatus = data.messages?.[0]?.message_status || 'accepted';

      try {
        await query(
          `INSERT INTO whatsapp_message_logs (
             wamid, recipient_phone, template_name, sender_phone_id,
             status, raw_payload, raw_response, accepted_at, updated_at
           ) VALUES ($1, $2, 'interactive_list', $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (wamid) DO UPDATE SET
             status = EXCLUDED.status,
             updated_at = CURRENT_TIMESTAMP`,
          [
            wamid,
            cleanTo,
            creds.phoneNumberId,
            messageStatus,
            JSON.stringify(payload),
            JSON.stringify(data),
          ]
        );
      } catch (logErr) {
        console.warn('[metaWhatsAppService] Failed to record interactive list in whatsapp_message_logs:', logErr.message);
      }

      return {
        success: true,
        wamid,
        metaMessageId: wamid,
        recipientPhone: cleanTo,
        status: 'sent',
        timestamp: new Date().toISOString(),
        metaResponse: data,
      };
    } catch (err) {
      console.error('[Meta Cloud API Fetch Exception]:', err.message);
      return {
        success: false,
        error: `Network connection failed: ${err.message}`,
      };
    }
  },

  // 4c. Send Catalog Message via Meta Cloud API (within 24-hour service window)
  sendCatalogMessage: async ({ to, bodyText = 'Explore our catalog', footerText, catalogParameters = {} }) => {
    if (!to) {
      return { success: false, error: 'Recipient phone number is required' };
    }

    const cleanTo = formatPhoneNumber(to);
    if (!cleanTo || cleanTo.length < 8) {
      return {
        success: false,
        error: `Invalid phone number format: "${to}". Must be a valid phone number with country code.`,
      };
    }

    const creds = await metaWhatsAppService.getCredentials();
    if (!creds.isConfigured) {
      return {
        success: false,
        error: 'META_CREDENTIALS_MISSING',
        message: 'WhatsApp Business API is not connected. Please configure your Meta credentials in environment variables.',
        missingFields: creds.missingFields,
      };
    }

    const url = `https://graph.facebook.com/${creds.version}/${creds.phoneNumberId}/messages`;
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo,
      type: 'interactive',
      interactive: {
        type: 'catalog_message',
        body: { text: bodyText.trim() },
        footer: footerText ? { text: footerText.trim() } : undefined,
        action: {
          name: 'catalog_message',
          parameters: catalogParameters,
        },
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        let customErrorMsg = data.error?.message || `Meta Cloud API error (HTTP ${response.status})`;
        if (data.error?.code === 131047 || data.error?.code === 131051) {
          customErrorMsg = 'The 24-hour WhatsApp customer service window has expired. A pre-approved template message is required to message this customer.';
        }
        console.warn(`[Meta Cloud API Send Catalog Message Failed]: ${customErrorMsg}`);
        return {
          success: false,
          error: customErrorMsg,
          rawError: data.error?.message,
          errorCode: data.error?.code,
          errorSubcode: data.error?.error_subcode,
          payload,
        };
      }

      const wamid = data.messages?.[0]?.id || `wamid_${Date.now()}`;
      const messageStatus = data.messages?.[0]?.message_status || 'accepted';

      try {
        await query(
          `INSERT INTO whatsapp_message_logs (
             wamid, recipient_phone, template_name, sender_phone_id,
             status, raw_payload, raw_response, accepted_at, updated_at
           ) VALUES ($1, $2, 'catalog_message', $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (wamid) DO UPDATE SET
             status = EXCLUDED.status,
             updated_at = CURRENT_TIMESTAMP`,
          [
            wamid,
            cleanTo,
            creds.phoneNumberId,
            messageStatus,
            JSON.stringify(payload),
            JSON.stringify(data),
          ]
        );
      } catch (logErr) {
        console.warn('[metaWhatsAppService] Failed to record catalog message in whatsapp_message_logs:', logErr.message);
      }

      return {
        success: true,
        wamid,
        metaMessageId: wamid,
        recipientPhone: cleanTo,
        status: 'sent',
        timestamp: new Date().toISOString(),
        metaResponse: data,
      };
    } catch (err) {
      console.error('[Meta Cloud API Fetch Exception]:', err.message);
      return {
        success: false,
        error: `Network connection failed: ${err.message}`,
      };
    }
  },

  // 5. Fetch Real WhatsApp Message Templates from Meta Graph API
  getWhatsAppTemplates: async () => {
    const creds = await metaWhatsAppService.getCredentials();
    if (!creds.isConfigured || !creds.wabaId) {
      return {
        success: false,
        error: 'WHATSAPP_NOT_CONNECTED',
        message: 'WhatsApp Business Account (WABA) is not connected or WABA ID is missing.',
        missingFields: creds.missingFields,
      };
    }

    const url = `https://graph.facebook.com/${creds.version}/${creds.wabaId}/message_templates?limit=100`;

    try {
      console.log(`[Meta Cloud API] Fetching message templates from WABA ID ${creds.wabaId}...`);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        console.error(
          `[Meta Cloud API Template Fetch Failed] Status: ${response.status}, Code: ${data.error?.code || 'N/A'}, Subcode: ${data.error?.error_subcode || 'N/A'}, Type: ${data.error?.type || 'N/A'}, Message: ${data.error?.message || 'Unknown error'}`
        );
        let customError = data.error?.message || `Meta API HTTP ${response.status}`;
        if (data.error?.code === 132001) {
          customError = 'WhatsApp template not found for the selected language. Please select an approved template from your connected Meta WhatsApp Business account.';
        }

        // Safe Fallback: Check local PostgreSQL database for active approved Meta templates
        try {
          const dbTmpls = await query(
            `SELECT id, name, category, language, status, header_type, header_text, body_text, footer_text, buttons
             FROM campaign_templates 
             WHERE is_sample = false AND status = 'APPROVED'
             ORDER BY created_at ASC`
          );
          if (dbTmpls.rows.length > 0) {
            const cachedApproved = dbTmpls.rows.map((t) => {
              const buttons = typeof t.buttons === 'string' ? JSON.parse(t.buttons || '[]') : (t.buttons || []);
              const bodyText = t.body_text || '';
              const bodyVariables = [];
              const matches = bodyText.match(/\{\{(\d+)\}\}/g);
              if (matches) {
                matches.forEach((m) => {
                  const num = m.replace(/\D/g, '');
                  if (!bodyVariables.includes(num)) bodyVariables.push(num);
                });
              }
              return {
                id: t.id,
                name: t.name,
                status: t.status,
                category: t.category || 'MARKETING',
                language: t.language || 'en_US',
                headerText: t.header_text || '',
                bodyText,
                bodyVariables,
                footerText: t.footer_text || '',
                buttons,
              };
            });

            return {
              success: true,
              fromCache: true,
              data: cachedApproved,
              approved: cachedApproved,
              total: cachedApproved.length,
              approvedCount: cachedApproved.length,
              metaError: customError,
              errorCode: data.error?.code,
            };
          }
        } catch (dbErr) {
          console.warn('[metaWhatsAppService] DB template fallback query error:', dbErr.message);
        }

        return {
          success: false,
          error: customError,
          rawError: data.error?.message,
          errorCode: data.error?.code,
          errorSubcode: data.error?.error_subcode,
        };
      }

      const templates = Array.isArray(data.data) ? data.data : [];
      // Parse templates into clean standard format
      const formatted = templates.map((t) => {
        const components = Array.isArray(t.components) ? t.components : [];
        const headerComp = components.find((c) => c.type === 'HEADER');
        const bodyComp = components.find((c) => c.type === 'BODY');
        const footerComp = components.find((c) => c.type === 'FOOTER');
        const buttonsComp = components.find((c) => c.type === 'BUTTONS');

        const bodyText = bodyComp?.text || '';
        const bodyVariables = [];
        const matches = bodyText.match(/\{\{(\d+)\}\}/g);
        if (matches) {
          matches.forEach((m) => {
            const num = m.replace(/\D/g, '');
            if (!bodyVariables.includes(num)) {
              bodyVariables.push(num);
            }
          });
        }

        return {
          id: t.id,
          name: t.name,
          status: t.status, // 'APPROVED', 'REJECTED', 'PENDING', 'PAUSED'
          category: t.category || 'MARKETING',
          language: t.language, // exact language code from Meta e.g. 'en', 'en_US', 'hi'
          components: t.components,
          headerText: headerComp?.text || (headerComp?.format ? `[${headerComp.format} Header]` : ''),
          bodyText,
          bodyVariables,
          footerText: footerComp?.text || '',
          buttons: buttonsComp?.buttons || [],
          rejectedReason: t.rejected_reason || null,
          qualityScore: t.quality_score?.score || null,
        };
      });

      const approved = formatted.filter((t) => t.status === 'APPROVED');

      return {
        success: true,
        data: formatted,
        approved,
        total: formatted.length,
        approvedCount: approved.length,
      };
    } catch (err) {
      console.error('[Meta Cloud API Fetch Templates Exception]:', err.message);
      return {
        success: false,
        error: `Failed to fetch message templates from Meta Cloud API: ${err.message}`,
      };
    }
  },
};
