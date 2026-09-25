import crypto from 'crypto';
import { query } from '../config/db.js';
import { generateAppSecretProof, appendAppSecretProof, sanitizeMetaUrl } from '../utils/metaCrypto.js';

import { encryptToken, decryptToken } from '../utils/crypto.js';

export { encryptToken, decryptToken } from '../utils/crypto.js';
export { generateAppSecretProof, appendAppSecretProof, sanitizeMetaUrl } from '../utils/metaCrypto.js';

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
  // If 11-digit starting with 0 followed by 6-9, replace 0 with 91
  if (digits.length === 11 && digits.startsWith('0') && /^[6-9]/.test(digits.slice(1))) {
    digits = `91${digits.slice(1)}`;
  }
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

  // Determine candidate raw phone string (cleanFull takes precedence if non-empty)
  const candidate = cleanFull || cleanPhone;
  if (!candidate) {
    return {
      isValid: false,
      normalizedPhone: '',
      reason: 'Missing phone number',
    };
  }

  const hasLeadingPlus = candidate.startsWith('+');
  let digits = candidate.replace(/\D/g, '');

  if (!digits) {
    return {
      isValid: false,
      normalizedPhone: '',
      reason: 'No digits found in phone number',
    };
  }

  // 1. Explicit leading '+' (e.g. "+91 98765 43210", "+1 415 555 2671")
  if (hasLeadingPlus) {
    if (digits.length >= 9 && digits.length <= 15) {
      return {
        isValid: true,
        normalizedPhone: digits,
        formattedDisplay: `+${digits}`,
      };
    }
    return {
      isValid: false,
      normalizedPhone: digits,
      reason: 'Phone number with "+" must have between 9 and 15 digits',
    };
  }

  // 2. Explicit non-India country code provided (e.g. countryCode = '1', phone = '4155552671')
  if (cleanCc && cleanCc !== '91') {
    if (digits.startsWith(cleanCc) && digits.length >= cleanCc.length + 7 && digits.length <= 15) {
      return {
        isValid: true,
        normalizedPhone: digits,
        formattedDisplay: `+${digits}`,
      };
    }
    const combined = `${cleanCc}${digits.replace(/^0+/, '')}`;
    if (combined.length >= 9 && combined.length <= 15) {
      return {
        isValid: true,
        normalizedPhone: combined,
        formattedDisplay: `+${combined}`,
      };
    }
  }

  // 3. Indian numbers: 12 digits starting with '91' and valid mobile prefix [6-9]
  if (digits.length === 12 && digits.startsWith('91') && /^[6-9]/.test(digits.slice(2))) {
    return {
      isValid: true,
      normalizedPhone: digits,
      formattedDisplay: `+91 ${digits.slice(2)}`,
    };
  }

  // 4. Indian numbers: 11 digits starting with '0' and valid mobile prefix [6-9]
  if (digits.length === 11 && digits.startsWith('0') && /^[6-9]/.test(digits.slice(1))) {
    const norm = `91${digits.slice(1)}`;
    return {
      isValid: true,
      normalizedPhone: norm,
      formattedDisplay: `+91 ${digits.slice(1)}`,
    };
  }

  // 5. Standard Indian mobile numbers: 10 digits starting with [6-9]
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return {
      isValid: true,
      normalizedPhone: `91${digits}`,
      formattedDisplay: `+91 ${digits}`,
    };
  }

  // 6. Explicit countryCode '91' with 10 digits
  if (cleanCc === '91' && digits.length === 10) {
    return {
      isValid: true,
      normalizedPhone: `91${digits}`,
      formattedDisplay: `+91 ${digits}`,
    };
  }

  // 7. General international digits already including country code (9-15 digits)
  if (digits.length >= 9 && digits.length <= 15) {
    return {
      isValid: true,
      normalizedPhone: digits,
      formattedDisplay: `+${digits}`,
    };
  }

  return {
    isValid: false,
    normalizedPhone: digits,
    reason: 'Invalid phone format (must be 9-15 digits with valid country code)',
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
  normalizeRecipientPhone,
  formatPhoneNumber,

  // 1. Resolve Meta WhatsApp Cloud API credentials
  getCredentials: async (userId = null) => {
    // Check environment variables first
    const envToken = process.env.META_ACCESS_TOKEN || process.env.META_WHATSAPP_TOKEN || process.env.WHATSAPP_TOKEN;
    const envPhoneId = process.env.META_PHONE_NUMBER_ID || process.env.META_WHATSAPP_PHONE_NUMBER_ID || process.env.WHATSAPP_PHONE_NUMBER_ID;
    const envWabaId = process.env.META_WABA_ID || process.env.META_BUSINESS_ACCOUNT_ID || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
    const version = process.env.META_GRAPH_API_VERSION || 'v25.0';

    // 1. If tenant userId is provided, check if tenant has a connected DB integration
    if (userId) {
      try {
        const tenantRes = await query(
          `SELECT id, user_id, meta_business_id, waba_id, phone_number_id, display_phone_number,
                  access_token_encrypted, status
           FROM meta_integrations
           WHERE user_id = $1 AND status = 'connected'
           ORDER BY updated_at DESC LIMIT 1`,
          [userId]
        );

        if (tenantRes.rows.length > 0) {
          const row = tenantRes.rows[0];
          const decryptedToken = decryptToken(row.access_token_encrypted);
          const effectiveToken = decryptedToken || row.access_token_encrypted;

          if (effectiveToken && row.phone_number_id) {
            return {
              isConfigured: true,
              source: 'database_tenant',
              tenantId: userId,
              accessToken: effectiveToken,
              phoneNumberId: row.phone_number_id,
              wabaId: row.waba_id,
              displayPhoneNumber: row.display_phone_number,
              version,
              missingFields: [],
            };
          }
        }
      } catch (err) {
        console.warn('[metaWhatsAppService] Tenant DB lookup for credentials failed:', err.message);
      }
    }

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
        tenantId: userId || 'default',
        accessToken: envToken,
        phoneNumberId: envPhoneId,
        wabaId: envWabaId || null,
        displayPhoneNumber: process.env.META_DISPLAY_PHONE_NUMBER || '+91 98765 43210',
        version,
        missingFields: [],
      };
    }

    // If neither explicit user DB integration nor valid environment configuration exists,
    // do NOT fall back to an arbitrary connected integration belonging to another user.
    // Return a safe, controlled unconfigured response.

    const missingFields = [];
    if (!envToken || envToken === 'your_meta_access_token_here') missingFields.push('META_ACCESS_TOKEN');
    if (!envPhoneId || envPhoneId === 'your_phone_number_id_here') missingFields.push('META_PHONE_NUMBER_ID');

    return {
      isConfigured: false,
      source: 'none',
      tenantId: userId || 'none',
      accessToken: null,
      phoneNumberId: null,
      wabaId: null,
      displayPhoneNumber: null,
      version,
      missingFields,
    };
  },

  // 2. Verify connection with Meta Graph API
  verifyConnection: async (userId = null) => {
    const creds = await metaWhatsAppService.getCredentials(userId);
    if (!creds.isConfigured) {
      return {
        isConnected: false,
        reason: 'Credentials not configured in environment or database',
        missingFields: creds.missingFields,
        creds,
      };
    }

    try {
      const rawUrl = `https://graph.facebook.com/${creds.version}/${creds.phoneNumberId}?fields=id,verified_name,display_phone_number,quality_rating,code_verification_status`;
      const url = appendAppSecretProof(rawUrl, creds.accessToken);
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
    userId = null,
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

    const creds = await metaWhatsAppService.getCredentials(userId);
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
      const templatesRes = await metaWhatsAppService.getWhatsAppTemplates(userId);
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
    const rawUrl = `https://graph.facebook.com/${creds.version}/${creds.phoneNumberId}/messages`;
    const url = appendAppSecretProof(rawUrl, creds.accessToken);

    try {
      // Diagnostic Log Entry for Outgoing Request (No secrets or proofs exposed)
      console.log(
        `[Meta Cloud API Outgoing Request] Phone Number ID: ${creds.phoneNumberId} | Recipient: +${cleanTo} | Template: "${templateName}" | Language: "${effectiveLanguage}" | Header Type: ${headerType} | Endpoint: ${sanitizeMetaUrl(url)}`
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
  sendTextMessage: async ({ to, text, previewUrl = false, userId = null }) => {
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

    const creds = await metaWhatsAppService.getCredentials(userId);
    if (!creds.isConfigured) {
      return {
        success: false,
        error: 'META_CREDENTIALS_MISSING',
        message: 'WhatsApp Business API is not connected. Please configure your Meta credentials in environment variables.',
        missingFields: creds.missingFields,
      };
    }

    const rawUrl = `https://graph.facebook.com/${creds.version}/${creds.phoneNumberId}/messages`;
    const url = appendAppSecretProof(rawUrl, creds.accessToken);
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
  sendInteractiveListMessage: async ({ to, headerText, bodyText, footerText, buttonText = 'Select an option', sections = [], userId = null }) => {
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

    const creds = await metaWhatsAppService.getCredentials(userId);
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

    const rawUrl = `https://graph.facebook.com/${creds.version}/${creds.phoneNumberId}/messages`;
    const url = appendAppSecretProof(rawUrl, creds.accessToken);
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
  sendCatalogMessage: async ({ to, bodyText = 'Explore our catalog', footerText, catalogParameters = {}, userId = null }) => {
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

    const creds = await metaWhatsAppService.getCredentials(userId);
    if (!creds.isConfigured) {
      return {
        success: false,
        error: 'META_CREDENTIALS_MISSING',
        message: 'WhatsApp Business API is not connected. Please configure your Meta credentials in environment variables.',
        missingFields: creds.missingFields,
      };
    }

    const rawUrl = `https://graph.facebook.com/${creds.version}/${creds.phoneNumberId}/messages`;
    const url = appendAppSecretProof(rawUrl, creds.accessToken);
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
  getWhatsAppTemplates: async (userId = null) => {
    const creds = await metaWhatsAppService.getCredentials(userId);
    if (!creds.isConfigured || !creds.wabaId) {
      return {
        success: false,
        error: 'WHATSAPP_NOT_CONNECTED',
        message: 'WhatsApp Business Account (WABA) is not connected or WABA ID is missing.',
        missingFields: creds.missingFields,
      };
    }

    const rawUrl = `https://graph.facebook.com/${creds.version}/${creds.wabaId}/message_templates?limit=100`;
    const url = appendAppSecretProof(rawUrl, creds.accessToken);

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

  // Helper to validate and format template identifier name for Meta
  validateAndFormatTemplateName: (name) => {
    if (!name || typeof name !== 'string') {
      return { isValid: false, error: 'Template name is required.' };
    }
    const clean = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    if (!clean) {
      return { isValid: false, error: 'Template name must contain alphanumeric characters.' };
    }
    if (clean.length > 512) {
      return { isValid: false, error: 'Template name cannot exceed 512 characters.' };
    }
    return { isValid: true, name: clean };
  },

  // Helper to validate template variables syntax and consecutive numbering
  validateTemplateVariables: (bodyText) => {
    if (!bodyText) return { isValid: true, count: 0, variables: [] };

    // Check for invalid non-numeric variables like {{name}}, {{user_id}}
    const nonNumeric = bodyText.match(/\{\{([a-zA-Z_][\w]*)\}\}/g);
    if (nonNumeric && nonNumeric.length > 0) {
      return {
        isValid: false,
        error: `Invalid variable syntax: WhatsApp Cloud API requires numeric variables like {{1}}, {{2}}. Found: "${nonNumeric[0]}"`,
      };
    }

    const matches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
    const nums = matches.map((m) => parseInt(m.replace(/\D/g, ''), 10));
    const uniqueNums = Array.from(new Set(nums)).sort((a, b) => a - b);

    if (uniqueNums.length === 0) {
      return { isValid: true, count: 0, variables: [] };
    }

    if (uniqueNums[0] !== 1) {
      return {
        isValid: false,
        error: `Variables must start with {{1}}. Found lowest variable: {{${uniqueNums[0]}}}`,
      };
    }

    for (let i = 0; i < uniqueNums.length; i++) {
      if (uniqueNums[i] !== i + 1) {
        return {
          isValid: false,
          error: `Variables must be consecutive numbers with no gaps. Expected {{${i + 1}}} but found {{${uniqueNums[i]}}}.`,
        };
      }
    }

    return { isValid: true, count: uniqueNums.length, variables: uniqueNums };
  },

  // Build Meta WhatsApp Business Management API compliant payload
  buildMetaTemplatePayload: ({ template, sampleValues = {}, headerHandle = null }) => {
    if (!template) {
      throw new Error('Template object is required to build Meta payload.');
    }

    // 1. Name validation
    const nameCheck = metaWhatsAppService.validateAndFormatTemplateName(template.name);
    if (!nameCheck.isValid) {
      throw new Error(nameCheck.error);
    }

    // 2. Category mapping & validation
    const rawCategory = String(template.category || 'MARKETING').toUpperCase();
    let category = 'MARKETING';
    if (rawCategory === 'UTILITY' || rawCategory === 'TRANSACTIONAL' || rawCategory === 'SERVICE_ALERTS') {
      category = 'UTILITY';
    } else if (rawCategory === 'AUTHENTICATION' || rawCategory === 'AUTH') {
      category = 'AUTHENTICATION';
    } else {
      category = 'MARKETING';
    }

    // 3. Language code
    const language = template.language || 'en_US';

    // 4. Body component and variable validation
    const bodyText = String(template.body || '').trim();
    if (!bodyText) {
      throw new Error('Message body text is required for template creation.');
    }
    if (bodyText.length > 1024) {
      throw new Error('Message body text cannot exceed 1024 characters.');
    }

    const varCheck = metaWhatsAppService.validateTemplateVariables(bodyText);
    if (!varCheck.isValid) {
      throw new Error(varCheck.error);
    }

    const components = [];

    // --- HEADER COMPONENT ---
    const headerType = String(template.header_type || 'NONE').toUpperCase();
    if (headerType === 'TEXT') {
      const hText = String(template.header_text || '').trim();
      if (!hText) {
        throw new Error('Header text is required when Header Type is set to TEXT.');
      }
      if (hText.length > 60) {
        throw new Error('Header text cannot exceed 60 characters.');
      }
      const headerComp = {
        type: 'HEADER',
        format: 'TEXT',
        text: hText,
      };
      // Check for variables in header text (max 1 allowed in Meta header)
      const hVars = hText.match(/\{\{(\d+)\}\}/g) || [];
      if (hVars.length > 1) {
        throw new Error('Header text can contain at most one variable {{1}}.');
      } else if (hVars.length === 1) {
        const sampleHeaderVal =
          (sampleValues && (sampleValues.header || sampleValues.header_1 || sampleValues.var_header)) ||
          'Sample';
        headerComp.example = {
          header_text: [String(sampleHeaderVal).trim() || 'Sample'],
        };
      }
      components.push(headerComp);
    } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerType)) {
      const headerComp = {
        type: 'HEADER',
        format: headerType,
      };
      if (headerHandle) {
        headerComp.example = {
          header_handle: [headerHandle],
        };
      }
      components.push(headerComp);
    }

    // --- BODY COMPONENT ---
    const bodyComp = {
      type: 'BODY',
      text: bodyText,
    };
    if (varCheck.count > 0) {
      const samples = [];
      for (let i = 1; i <= varCheck.count; i++) {
        let val = '';
        if (sampleValues) {
          val =
            sampleValues[`var_${i}`] ||
            sampleValues[`Variable ${i}`] ||
            sampleValues[String(i)] ||
            (Array.isArray(sampleValues) ? sampleValues[i - 1] : '') ||
            '';
        }
        samples.push(String(val).trim() || `Sample_${i}`);
      }
      bodyComp.example = {
        body_text: [samples],
      };
    }
    components.push(bodyComp);

    // --- FOOTER COMPONENT ---
    const footerText = String(template.footer || '').trim();
    if (footerText) {
      if (footerText.length > 60) {
        throw new Error('Footer text cannot exceed 60 characters.');
      }
      if (/\{\{\d+\}\}/.test(footerText)) {
        throw new Error('Footer text cannot contain variables in WhatsApp templates.');
      }
      components.push({
        type: 'FOOTER',
        text: footerText,
      });
    }

    // --- BUTTONS COMPONENT ---
    const rawButtons = Array.isArray(template.buttons)
      ? template.buttons
      : JSON.parse(template.buttons || '[]');

    if (rawButtons.length > 0) {
      if (rawButtons.length > 3) {
        throw new Error('Maximum 3 buttons allowed for standard WhatsApp templates.');
      }
      const formattedButtons = [];
      for (const btn of rawButtons) {
        const bType = String(btn.type || 'QUICK_REPLY').toUpperCase();
        const bText = String(btn.text || '').trim();
        if (!bText) {
          throw new Error('Button text cannot be empty.');
        }
        if (bText.length > 25) {
          throw new Error(`Button text "${bText}" exceeds maximum 25 characters.`);
        }

        if (bType === 'QUICK_REPLY') {
          formattedButtons.push({
            type: 'QUICK_REPLY',
            text: bText,
          });
        } else if (bType === 'URL') {
          const urlStr = String(btn.url || '').trim();
          if (!urlStr || (!urlStr.startsWith('http://') && !urlStr.startsWith('https://'))) {
            throw new Error(`Button "${bText}" has an invalid URL. URLs must start with https:// or http://.`);
          }
          const hasDynamicVar = /\{\{1\}\}/.test(urlStr);
          const urlObj = {
            type: 'URL',
            text: bText,
            url: urlStr,
          };
          if (hasDynamicVar) {
            urlObj.example = [btn.sampleUrl || 'https://example.com/sample'];
          }
          formattedButtons.push(urlObj);
        } else if (bType === 'PHONE_NUMBER') {
          const cleanPhone = String(btn.phone_number || '').trim();
          if (!cleanPhone) {
            throw new Error(`Button "${bText}" requires a phone number with country code.`);
          }
          formattedButtons.push({
            type: 'PHONE_NUMBER',
            text: bText,
            phone_number: cleanPhone,
          });
        }
      }

      if (formattedButtons.length > 0) {
        components.push({
          type: 'BUTTONS',
          buttons: formattedButtons,
        });
      }
    }

    return {
      name: nameCheck.name,
      category,
      language,
      components,
    };
  },

  // Resumable upload for sample media asset to get Meta header_handle
  uploadMediaForTemplateHeader: async ({ mediaUrl, creds }) => {
    if (!mediaUrl || !creds?.accessToken) return null;
    try {
      let buffer = null;
      let mimeType = 'image/jpeg';
      let fileLength = 0;

      if (mediaUrl.startsWith('data:')) {
        const matches = mediaUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          mimeType = matches[1];
          buffer = Buffer.from(matches[2], 'base64');
          fileLength = buffer.length;
        }
      } else if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
        const res = await fetch(mediaUrl);
        if (res.ok) {
          mimeType = res.headers.get('content-type') || 'image/jpeg';
          const arrayBuf = await res.arrayBuffer();
          buffer = Buffer.from(arrayBuf);
          fileLength = buffer.length;
        }
      }

      if (!buffer || fileLength === 0) return null;

      // Create Meta Resumable Upload session
      const rawSessionUrl = `https://graph.facebook.com/${creds.version}/app/uploads?file_length=${fileLength}&file_type=${encodeURIComponent(mimeType)}`;
      const createSessionUrl = appendAppSecretProof(rawSessionUrl, creds.accessToken);
      const sessionRes = await fetch(createSessionUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
        },
      });
      const sessionData = await sessionRes.json();
      if (!sessionRes.ok || !sessionData.id) {
        console.warn('[Meta Cloud API] Failed to initiate header media upload session:', sessionData.error?.message || sessionData);
        return null;
      }

      // Upload binary payload
      const rawUploadUrl = `https://graph.facebook.com/${creds.version}/${sessionData.id}`;
      const uploadUrl = appendAppSecretProof(rawUploadUrl, creds.accessToken);
      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          Authorization: `OAuth ${creds.accessToken}`,
          file_offset: '0',
          'Content-Type': 'application/octet-stream',
        },
        body: buffer,
      });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.h) {
        console.warn('[Meta Cloud API] Failed to complete header media upload chunk:', uploadData.error?.message || uploadData);
        return null;
      }

      return uploadData.h;
    } catch (err) {
      console.warn('[Meta Cloud API] uploadMediaForTemplateHeader exception:', err.message);
      return null;
    }
  },

  // Submit template to Meta WhatsApp Business Management API
  createWhatsAppTemplate: async ({ template, sampleValues = {}, userId = null }) => {
    // 1. Resolve tenant credentials (enforcing tenant isolation)
    const creds = await metaWhatsAppService.getCredentials(userId);
    if (!creds.isConfigured || !creds.wabaId || !creds.accessToken) {
      return {
        success: false,
        error: 'WhatsApp Business Account (WABA) is not connected or WABA ID is missing. Please connect your Meta WhatsApp integration before submitting templates.',
        missingFields: creds.missingFields || ['waba_id'],
      };
    }

    // 2. Resolve header media handle if header requires media
    let headerHandle = template.header_handle || null;
    if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(template.header_type) && !headerHandle && template.header_media_url) {
      headerHandle = await metaWhatsAppService.uploadMediaForTemplateHeader({
        mediaUrl: template.header_media_url,
        creds,
      });
    }

    // 3. Build & validate Meta template payload
    let metaPayload;
    try {
      metaPayload = metaWhatsAppService.buildMetaTemplatePayload({
        template,
        sampleValues,
        headerHandle,
      });
    } catch (valErr) {
      return {
        success: false,
        error: valErr.message,
      };
    }

    // 4. Send POST request to Meta Graph API
    const rawUrl = `https://graph.facebook.com/${creds.version}/${creds.wabaId}/message_templates`;
    const url = appendAppSecretProof(rawUrl, creds.accessToken);

    try {
      console.log(
        `[Meta Cloud API Template Submit] WABA ID: ${creds.wabaId} | Template Name: "${metaPayload.name}" | Category: "${metaPayload.category}" | Language: "${metaPayload.language}" | Endpoint: ${sanitizeMetaUrl(url)}`
      );

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metaPayload),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        console.error('[Meta Cloud API Template Submit Error]:', JSON.stringify({
          status: response.status,
          errorCode: data.error?.code,
          errorSubcode: data.error?.error_subcode,
          errorMessage: data.error?.message,
          errorType: data.error?.type,
          fbtraceId: data.error?.fbtrace_id,
        }));

        let userErrorMsg = data.error?.message || `Meta API HTTP ${response.status}`;
        if (data.error?.code === 100 && (data.error?.error_subcode === 2388001 || /already exists/i.test(data.error?.message || ''))) {
          userErrorMsg = `A WhatsApp template with the name "${metaPayload.name}" and language "${metaPayload.language}" already exists in your connected WhatsApp Business Account. Please choose a different template name.`;
        } else if (data.error?.code === 190) {
          userErrorMsg = `Meta Access Token Session Expired (#190). Please reconnect your Meta WhatsApp integration or update the access token.`;
        } else if (data.error?.code === 100 && /variable|example/i.test(data.error?.message || '')) {
          userErrorMsg = `Meta rejected variable examples: ${data.error.message}`;
        } else if (data.error?.code === 100 && /header_handle/i.test(data.error?.message || '')) {
          userErrorMsg = `Meta requires a valid sample media file for ${template.header_type} headers. Please upload or select a valid media file.`;
        }

        return {
          success: false,
          error: userErrorMsg,
          rawError: data.error?.message,
          errorCode: data.error?.code,
          errorSubcode: data.error?.error_subcode,
          metaError: {
            code: data.error?.code,
            subcode: data.error?.error_subcode,
            message: data.error?.message,
          },
          wabaId: creds.wabaId,
          payload: metaPayload,
        };
      }

      // 5. Successful submission (Meta returns { id: "...", status: "PENDING", category: "..." })
      return {
        success: true,
        metaTemplateId: data.id,
        metaStatus: data.status || 'PENDING',
        category: data.category || metaPayload.category,
        wabaId: creds.wabaId,
        metaResponse: data,
      };
    } catch (err) {
      console.error('[Meta Cloud API Template Submit Exception]:', err.message);
      return {
        success: false,
        error: `Network error communicating with Meta Graph API: ${err.message}`,
      };
    }
  },

  // Synchronize actual Meta WhatsApp template statuses from Graph API
  syncTemplatesWithMeta: async (userId = null) => {
    const creds = await metaWhatsAppService.getCredentials(userId);
    if (!creds.isConfigured || !creds.wabaId || !creds.accessToken) {
      return {
        success: false,
        error: 'WHATSAPP_NOT_CONNECTED',
        message: 'WhatsApp Business Account (WABA) is not connected or WABA ID is missing.',
      };
    }

    const rawUrl = `https://graph.facebook.com/${creds.version}/${creds.wabaId}/message_templates?limit=100`;
    const url = appendAppSecretProof(rawUrl, creds.accessToken);

    try {
      console.log(`[Meta Cloud API] Syncing message templates from WABA ID ${creds.wabaId}...`);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
        },
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        return {
          success: false,
          error: data.error?.message || `Meta API HTTP ${response.status}`,
          errorCode: data.error?.code,
        };
      }

      const metaTemplates = Array.isArray(data.data) ? data.data : [];
      let syncedCount = 0;

      for (const mt of metaTemplates) {
        const metaId = mt.id;
        const metaName = mt.name;
        const metaStatus = mt.status; // 'APPROVED', 'PENDING', 'REJECTED', 'PAUSED', 'DISABLED'
        const rejectionReason = mt.rejected_reason || null;

        const updateRes = await query(
          `UPDATE whatsapp_templates 
           SET meta_status = $1, 
               status = $1, 
               meta_template_id = $2, 
               waba_id = $3, 
               rejection_reason = $4, 
               updated_at = CURRENT_TIMESTAMP 
           WHERE (name = $5 OR meta_template_id = $2) AND user_id = $6`,
          [metaStatus, metaId, creds.wabaId, rejectionReason, metaName, creds.tenantId || userId || 'usr_1']
        );

        if (updateRes.rowCount > 0) {
          syncedCount += updateRes.rowCount;
        }
      }

      return {
        success: true,
        syncedCount,
        totalFromMeta: metaTemplates.length,
        metaTemplates,
      };
    } catch (err) {
      console.error('[Meta Cloud API Template Sync Exception]:', err.message);
      return {
        success: false,
        error: `Failed to sync templates from Meta: ${err.message}`,
      };
    }
  },

  // 6. Fetch Meta WhatsApp Flow Details by Flow ID
  getFlow: async (flowId, userId = null) => {
    if (!flowId) {
      return { success: false, error: 'Flow ID is required' };
    }

    const creds = await metaWhatsAppService.getCredentials(userId);
    if (!creds.isConfigured) {
      return {
        success: false,
        error: 'META_CREDENTIALS_MISSING',
        message: 'WhatsApp Business API is not connected. Please configure your Meta credentials.',
        missingFields: creds.missingFields,
      };
    }

    const cleanFlowId = String(flowId).trim();
    const rawUrl = `https://graph.facebook.com/${creds.version}/${cleanFlowId}?fields=id,name,status,categories,validation_errors,json_version,data_api_version,endpoint_uri,preview`;
    const url = appendAppSecretProof(rawUrl, creds.accessToken);

    try {
      console.log(`[Meta Cloud API] Fetching Flow ${cleanFlowId} from Meta Graph API (${creds.version})...`);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        console.error(
          `[Meta Cloud API Flow Fetch Failed] Status: ${response.status}, Code: ${data.error?.code || 'N/A'}, Subcode: ${data.error?.error_subcode || 'N/A'}, Message: ${data.error?.message || 'Unknown error'}`
        );

        let customErrorMsg = data.error?.message || `Meta Graph API returned HTTP ${response.status}`;
        if (data.error?.code === 190) {
          customErrorMsg = `Meta Access Token Session Expired (Error #190): ${data.error?.message || 'Please update META_ACCESS_TOKEN in .env'}`;
        }

        return {
          success: false,
          error: customErrorMsg,
          rawError: data.error?.message,
          errorCode: data.error?.code,
          errorSubcode: data.error?.error_subcode,
          errorType: data.error?.type,
          fbtraceId: data.error?.fbtrace_id,
        };
      }

      return {
        success: true,
        flowId: data.id,
        name: data.name,
        status: data.status, // e.g. 'PUBLISHED', 'DRAFT', 'DEPRECATED', 'BLOCKED'
        categories: data.categories || [],
        validationErrors: data.validation_errors || [],
        jsonVersion: data.json_version || null,
        dataApiVersion: data.data_api_version || null,
        endpointUri: data.endpoint_uri || null,
        preview: data.preview || null,
        rawData: data,
      };
    } catch (err) {
      console.error('[Meta Cloud API Fetch Flow Exception]:', err.message);
      return {
        success: false,
        error: `Network error fetching Flow from Meta: ${err.message}`,
      };
    }
  },

  // 7. Fetch Meta WhatsApp Flow Assets (Screens / JSON definition)
  getFlowAssets: async (flowId, userId = null) => {
    if (!flowId) {
      return { success: false, error: 'Flow ID is required' };
    }

    const creds = await metaWhatsAppService.getCredentials(userId);
    if (!creds.isConfigured) {
      return {
        success: false,
        error: 'META_CREDENTIALS_MISSING',
        message: 'WhatsApp Business API is not connected.',
        missingFields: creds.missingFields,
      };
    }

    const cleanFlowId = String(flowId).trim();
    const rawUrl = `https://graph.facebook.com/${creds.version}/${cleanFlowId}/assets`;
    const url = appendAppSecretProof(rawUrl, creds.accessToken);

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        return {
          success: false,
          error: data.error?.message || `Meta Graph API returned HTTP ${response.status}`,
          errorCode: data.error?.code,
          errorSubcode: data.error?.error_subcode,
        };
      }

      return {
        success: true,
        assets: data.data || [],
      };
    } catch (err) {
      return {
        success: false,
        error: `Network error fetching Flow assets: ${err.message}`,
      };
    }
  },

  // 8. Send Interactive Flow Message via Meta WhatsApp Cloud API
  sendFlowMessage: async ({
    to,
    recipientPhone,
    flowId,
    ctaText = 'Open',
    headerText,
    bodyText = 'Please complete our quick form',
    footerText,
    screen,
    flowToken,
    data = {},
    mode = 'navigate',
    userId = null,
  }) => {
    const targetPhone = to || recipientPhone;
    if (!targetPhone) {
      return { success: false, error: 'Recipient phone number is required' };
    }
    if (!flowId) {
      return { success: false, error: 'Flow ID is required' };
    }

    const cleanTo = formatPhoneNumber(targetPhone);
    if (!cleanTo || cleanTo.length < 8) {
      return {
        success: false,
        error: `Invalid phone number format: "${targetPhone}". Must be a valid phone number with country code.`,
      };
    }

    const creds = await metaWhatsAppService.getCredentials(userId);
    if (!creds.isConfigured) {
      return {
        success: false,
        error: 'META_CREDENTIALS_MISSING',
        message: 'WhatsApp Business API is not connected. Please configure your Meta credentials in environment variables.',
        missingFields: creds.missingFields,
      };
    }

    const resolvedFlowToken = flowToken || `token_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const parameters = {
      flow_message_version: '3',
      flow_token: resolvedFlowToken,
      flow_id: String(flowId).trim(),
      flow_cta: (ctaText || 'Open').trim().slice(0, 20),
      flow_action: mode || 'navigate',
    };

    let resolvedScreen = screen ? String(screen).trim() : null;
    if (!resolvedScreen) {
      try {
        const assetsRes = await metaWhatsAppService.getFlowAssets(flowId);
        if (assetsRes.success && assetsRes.assets?.length > 0) {
          const flowJsonAsset = assetsRes.assets.find((a) => a.asset_type === 'FLOW_JSON') || assetsRes.assets[0];
          if (flowJsonAsset?.download_url) {
            const dlRes = await fetch(flowJsonAsset.download_url, {
              headers: { Authorization: `Bearer ${creds.accessToken}` },
            });
            const flowDef = await dlRes.json();
            if (flowDef.screens && flowDef.screens.length > 0) {
              resolvedScreen = flowDef.screens[0].id;
              console.log(`[Meta Cloud API] Auto-resolved initial screen "${resolvedScreen}" for Flow ${flowId}`);
            }
          }
        }
      } catch (assetErr) {
        // Proceed if auto-resolution fails
      }
    }

    if (resolvedScreen) {
      parameters.flow_action_payload = {
        screen: resolvedScreen,
        ...(data && typeof data === 'object' && Object.keys(data).length > 0 ? { data } : {}),
      };
    } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
      parameters.flow_action_payload = { data };
    }

    const interactivePayload = {
      type: 'flow',
      body: { text: (bodyText || 'Please complete our quick form').trim().slice(0, 1024) },
      action: {
        name: 'flow',
        parameters,
      },
    };

    if (headerText && headerText.trim()) {
      interactivePayload.header = { type: 'text', text: headerText.trim().slice(0, 60) };
    }
    if (footerText && footerText.trim()) {
      interactivePayload.footer = { text: footerText.trim().slice(0, 60) };
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo,
      type: 'interactive',
      interactive: interactivePayload,
    };

    const rawUrl = `https://graph.facebook.com/${creds.version}/${creds.phoneNumberId}/messages`;
    const url = appendAppSecretProof(rawUrl, creds.accessToken);

    try {
      console.log(
        `[Meta Cloud API Outgoing Flow] Phone ID: ${creds.phoneNumberId} | Recipient: +${cleanTo} | Flow ID: ${flowId} | CTA: "${parameters.flow_cta}"`
      );

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok || resData.error) {
        let customErrorMsg = resData.error?.message || `Meta Cloud API error (HTTP ${response.status})`;
        if (resData.error?.error_data?.details) {
          customErrorMsg = `${customErrorMsg}: ${resData.error.error_data.details}`;
        } else if (resData.error?.code === 131047 || resData.error?.code === 131051) {
          customErrorMsg = 'The 24-hour WhatsApp customer service window has expired. A pre-approved template message is required to message this customer.';
        } else if (resData.error?.code === 131030) {
          customErrorMsg = `Recipient phone (+${cleanTo}) is not in Meta Allowed Numbers list (Development mode).`;
        } else if (resData.error?.code === 190) {
          customErrorMsg = `Meta Access Token Session Expired (#190): ${resData.error?.message || 'Please update META_ACCESS_TOKEN in .env'}`;
        }

        console.warn(`[Meta Cloud API Send Flow Failed]: ${customErrorMsg}`);
        return {
          success: false,
          error: customErrorMsg,
          rawError: resData.error?.message,
          errorCode: resData.error?.code,
          errorSubcode: resData.error?.error_subcode,
          errorType: resData.error?.type,
          fbtraceId: resData.error?.fbtrace_id,
          payload,
        };
      }

      const wamid = resData.messages?.[0]?.id || `wamid_${Date.now()}`;
      const messageStatus = resData.messages?.[0]?.message_status || 'accepted';

      // Persist outbound dispatch in whatsapp_message_logs
      try {
        await query(
          `INSERT INTO whatsapp_message_logs (
             wamid, recipient_phone, template_name, sender_phone_id,
             status, raw_payload, raw_response, accepted_at, updated_at
           ) VALUES ($1, $2, 'flow_message', $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           ON CONFLICT (wamid) DO UPDATE SET
             status = EXCLUDED.status,
             updated_at = CURRENT_TIMESTAMP`,
          [
            wamid,
            cleanTo,
            creds.phoneNumberId,
            messageStatus,
            JSON.stringify(payload),
            JSON.stringify(resData),
          ]
        );
      } catch (logErr) {
        console.warn('[metaWhatsAppService] Failed to record flow message in whatsapp_message_logs:', logErr.message);
      }

      return {
        success: true,
        wamid,
        metaMessageId: wamid,
        flowId: String(flowId),
        flowToken: resolvedFlowToken,
        recipientPhone: cleanTo,
        status: messageStatus,
        timestamp: new Date().toISOString(),
        metaResponse: resData,
        payload,
      };
    } catch (err) {
      console.error('[Meta Cloud API Fetch Flow Exception]:', err.message);
      return {
        success: false,
        error: `Network connection failed: ${err.message}`,
      };
    }
  },
};
