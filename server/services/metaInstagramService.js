import { query } from '../config/db.js';
import { encryptToken, decryptToken } from '../utils/crypto.js';
import { appendAppSecretProof, sanitizeMetaUrl } from '../utils/metaCrypto.js';

const META_GRAPH_VERSION = 'v21.0';
const GRAPH_BASE_URL = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

/**
 * Service handling Instagram Graph API integration, Facebook Login discovery,
 * Webhook event ingestion, and Unified Team Inbox DM messaging.
 */
export const metaInstagramService = {
  /**
   * Retrieves active credentials for a given user/tenant.
   */
  async getCredentials(userId) {
    if (userId) {
      try {
        const res = await query(
          `SELECT * FROM instagram_integrations 
           WHERE user_id = $1 AND status = 'connected' 
           ORDER BY updated_at DESC LIMIT 1`,
          [userId]
        );

        if (res.rows.length > 0) {
          const row = res.rows[0];
          let token = row.page_access_token;
          if (token && token.includes(':')) {
            try {
              token = decryptToken(token) || token;
            } catch (decErr) {
              console.warn('[Instagram Service] Decryption fallback used for page token:', decErr.message);
            }
          }

          return {
            id: row.id,
            userId: row.user_id,
            pageId: row.page_id,
            pageName: row.page_name,
            pageAccessToken: token,
            igAccountId: row.instagram_business_account_id,
            igUsername: row.instagram_username,
            igName: row.instagram_name,
            profilePictureUrl: row.profile_picture_url,
            status: row.status,
            updatedAt: row.updated_at,
          };
        }
      } catch (dbErr) {
        console.warn('[Instagram Service] Database lookup error:', dbErr.message);
      }
    }

    // Server-level environment variable fallback
    if (
      process.env.INSTAGRAM_PAGE_ACCESS_TOKEN ||
      process.env.INSTAGRAM_PAGE_ID ||
      process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
    ) {
      return {
        id: 'env_instagram_default',
        userId: userId || 'usr_default',
        pageId: process.env.INSTAGRAM_PAGE_ID || '',
        pageName: process.env.INSTAGRAM_PAGE_NAME || 'ARCO Instagram Business',
        pageAccessToken: process.env.INSTAGRAM_PAGE_ACCESS_TOKEN || '',
        igAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '',
        igUsername: process.env.INSTAGRAM_USERNAME || 'arco_official',
        igName: process.env.INSTAGRAM_NAME || 'ARCO Communication',
        profilePictureUrl: null,
        status: 'connected',
      };
    }

    return null;
  },

  /**
   * Connects via Meta user access token obtained from Facebook Login popup.
   * Discovers connected Facebook Pages and their linked Instagram Business Accounts.
   */
  async connectWithToken({ userAccessToken, userId }) {
    if (!userAccessToken) {
      throw new Error('User access token is required from Facebook Login.');
    }

    // 1. Fetch user accounts (Facebook Pages) and linked Instagram Business Accounts
    const accountsUrl = `${GRAPH_BASE_URL}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}&access_token=${userAccessToken}`;
    const secureAccountsUrl = appendAppSecretProof(accountsUrl, userAccessToken);

    const resp = await fetch(secureAccountsUrl);
    const data = await resp.json();

    if (!resp.ok || data.error) {
      const err = new Error(data.error?.message || 'Failed to fetch Facebook Pages from Meta Graph API');
      err.code = data.error?.code;
      throw err;
    }

    const pages = data.data || [];
    if (pages.length === 0) {
      throw new Error('No Facebook Pages found associated with this Facebook account. Please create or manage a Facebook Page first.');
    }

    // Find the first page with a linked Instagram Business Account
    const pageWithIg = pages.find((p) => p.instagram_business_account && p.instagram_business_account.id);

    if (!pageWithIg) {
      throw new Error(
        'No Instagram Professional/Business account found linked to your Facebook Pages. Please ensure your Instagram account is switched to Business or Creator and linked to your Facebook Page in Instagram Settings.'
      );
    }

    const igAccount = pageWithIg.instagram_business_account;
    const pageId = pageWithIg.id;
    const pageName = pageWithIg.name;
    const pageAccessToken = pageWithIg.access_token;

    // 2. Subscribe Facebook Page to App Webhooks
    try {
      const subscribeUrl = `${GRAPH_BASE_URL}/${pageId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,message_reactions&access_token=${pageAccessToken}`;
      const secureSubUrl = appendAppSecretProof(subscribeUrl, pageAccessToken);
      const subRes = await fetch(secureSubUrl, { method: 'POST' });
      const subData = await subRes.json();
      console.log(`[Instagram Service] Webhook subscription for page ${pageId}:`, subData);
    } catch (subErr) {
      console.warn('[Instagram Service] Webhook subscription notice:', subErr.message);
    }

    // 3. Encrypt access token and upsert into database
    const encryptedToken = encryptToken(pageAccessToken) || pageAccessToken;
    const integrationId = `ig_${userId || 'usr_default'}_${igAccount.id}`;

    await query(
      `INSERT INTO instagram_integrations (
         id, user_id, page_id, page_name, page_access_token,
         instagram_business_account_id, instagram_username, instagram_name,
         profile_picture_url, status, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'connected', CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         page_name = EXCLUDED.page_name,
         page_access_token = EXCLUDED.page_access_token,
         instagram_username = EXCLUDED.instagram_username,
         instagram_name = EXCLUDED.instagram_name,
         profile_picture_url = EXCLUDED.profile_picture_url,
         status = 'connected',
         updated_at = CURRENT_TIMESTAMP`,
      [
        integrationId,
        userId || 'usr_default',
        pageId,
        pageName,
        encryptedToken,
        igAccount.id,
        igAccount.username || '',
        igAccount.name || igAccount.username || pageName,
        igAccount.profile_picture_url || null,
      ]
    );

    return {
      success: true,
      data: {
        pageId,
        pageName,
        instagramBusinessAccountId: igAccount.id,
        instagramUsername: igAccount.username,
        instagramName: igAccount.name,
        profilePictureUrl: igAccount.profile_picture_url,
        status: 'connected',
      },
    };
  },

  /**
   * Direct manual connection fallback for developers or custom Page token input.
   */
  async connectDirect({ pageId, pageName, pageAccessToken, igAccountId, igUsername, userId }) {
    if (!pageAccessToken || !pageId) {
      throw new Error('pageId and pageAccessToken are required for direct connection.');
    }

    let resolvedIgId = igAccountId;
    let resolvedUsername = igUsername || '';
    let resolvedName = pageName || 'Instagram Professional';
    let profilePic = null;

    // Validate token and discover IG details if igAccountId not provided
    try {
      if (!resolvedIgId) {
        const pageUrl = `${GRAPH_BASE_URL}/${pageId}?fields=id,name,instagram_business_account{id,username,name,profile_picture_url}&access_token=${pageAccessToken}`;
        const secureUrl = appendAppSecretProof(pageUrl, pageAccessToken);
        const resp = await fetch(secureUrl);
        const pageData = await resp.json();
        if (pageData?.instagram_business_account) {
          resolvedIgId = pageData.instagram_business_account.id;
          resolvedUsername = pageData.instagram_business_account.username || resolvedUsername;
          resolvedName = pageData.instagram_business_account.name || resolvedName;
          profilePic = pageData.instagram_business_account.profile_picture_url || null;
        }
      } else {
        const igUrl = `${GRAPH_BASE_URL}/${resolvedIgId}?fields=id,username,name,profile_picture_url&access_token=${pageAccessToken}`;
        const secureUrl = appendAppSecretProof(igUrl, pageAccessToken);
        const resp = await fetch(secureUrl);
        const igData = await resp.json();
        if (igData && !igData.error) {
          resolvedUsername = igData.username || resolvedUsername;
          resolvedName = igData.name || resolvedName;
          profilePic = igData.profile_picture_url || null;
        }
      }
    } catch (checkErr) {
      console.warn('[Instagram Service] Meta validation warning:', checkErr.message);
    }

    if (!resolvedIgId) {
      resolvedIgId = `ig_acc_${pageId}`;
    }

    // Subscribe Page to webhooks
    try {
      const subscribeUrl = `${GRAPH_BASE_URL}/${pageId}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,message_reactions&access_token=${pageAccessToken}`;
      const secureSubUrl = appendAppSecretProof(subscribeUrl, pageAccessToken);
      await fetch(secureSubUrl, { method: 'POST' });
    } catch (subErr) {
      console.warn('[Instagram Service] Direct webhook subscription warning:', subErr.message);
    }

    const encryptedToken = encryptToken(pageAccessToken) || pageAccessToken;
    const integrationId = `ig_${userId || 'usr_default'}_${resolvedIgId}`;

    await query(
      `INSERT INTO instagram_integrations (
         id, user_id, page_id, page_name, page_access_token,
         instagram_business_account_id, instagram_username, instagram_name,
         profile_picture_url, status, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'connected', CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE SET
         page_name = EXCLUDED.page_name,
         page_access_token = EXCLUDED.page_access_token,
         instagram_username = EXCLUDED.instagram_username,
         instagram_name = EXCLUDED.instagram_name,
         profile_picture_url = EXCLUDED.profile_picture_url,
         status = 'connected',
         updated_at = CURRENT_TIMESTAMP`,
      [
        integrationId,
        userId || 'usr_default',
        pageId,
        pageName || 'Connected Page',
        encryptedToken,
        resolvedIgId,
        resolvedUsername,
        resolvedName,
        profilePic,
      ]
    );

    return {
      success: true,
      data: {
        pageId,
        pageName: pageName || 'Connected Page',
        instagramBusinessAccountId: resolvedIgId,
        instagramUsername: resolvedUsername,
        instagramName: resolvedName,
        profilePictureUrl: profilePic,
        status: 'connected',
      },
    };
  },

  /**
   * Disconnects Instagram integration for the user.
   */
  async disconnect(userId) {
    if (!userId) return { success: false, error: 'User ID required' };
    await query(
      `UPDATE instagram_integrations 
       SET status = 'disconnected', updated_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1`,
      [userId]
    );
    return { success: true, message: 'Instagram account disconnected successfully.' };
  },

  /**
   * Sends an outbound Instagram Direct text message.
   * Calls POST https://graph.facebook.com/v21.0/me/messages (or /{page-id}/messages).
   */
  async sendTextMessage({ recipientId, text, userId }) {
    if (!recipientId) {
      return { success: false, error: 'Recipient ID (Instagram IGSID) is required.' };
    }
    if (!text || !text.trim()) {
      return { success: false, error: 'Message text cannot be empty.' };
    }

    const creds = await this.getCredentials(userId);
    if (!creds || !creds.pageAccessToken) {
      return {
        success: false,
        error: 'Instagram is not connected. Please connect your Instagram Professional account in Integrations.',
      };
    }

    const targetUrl = `${GRAPH_BASE_URL}/${creds.pageId || 'me'}/messages`;
    const secureUrl = appendAppSecretProof(targetUrl, creds.pageAccessToken);

    const payload = {
      recipient: { id: recipientId },
      message: { text: text.trim() },
    };

    try {
      const resp = await fetch(secureUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${creds.pageAccessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();

      if (!resp.ok || data.error) {
        console.error('[Instagram Outbound Send Error]:', data.error || data);
        return {
          success: false,
          error: data.error?.message || `Instagram API error: ${resp.status}`,
          code: data.error?.code,
          subcode: data.error?.error_subcode,
        };
      }

      return {
        success: true,
        messageId: data.message_id,
        recipientId: data.recipient_id,
      };
    } catch (err) {
      console.error('[Instagram Dispatch Network Error]:', err.message);
      return {
        success: false,
        error: err.message || 'Network error communicating with Meta Graph API',
      };
    }
  },

  /**
   * Sends an outbound Instagram Direct media attachment (image, audio, video).
   */
  async sendMediaMessage({ recipientId, mediaUrl, mediaType = 'image', userId }) {
    if (!recipientId || !mediaUrl) {
      return { success: false, error: 'Recipient ID and mediaUrl are required.' };
    }

    const creds = await this.getCredentials(userId);
    if (!creds || !creds.pageAccessToken) {
      return {
        success: false,
        error: 'Instagram is not connected. Please connect your Instagram Professional account in Integrations.',
      };
    }

    const targetUrl = `${GRAPH_BASE_URL}/${creds.pageId || 'me'}/messages`;
    const secureUrl = appendAppSecretProof(targetUrl, creds.pageAccessToken);

    const payload = {
      recipient: { id: recipientId },
      message: {
        attachment: {
          type: mediaType,
          payload: { url: mediaUrl },
        },
      },
    };

    try {
      const resp = await fetch(secureUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${creds.pageAccessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await resp.json();
      if (!resp.ok || data.error) {
        return {
          success: false,
          error: data.error?.message || 'Instagram media dispatch failed',
        };
      }

      return {
        success: true,
        messageId: data.message_id,
        recipientId: data.recipient_id,
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Resolves Instagram User Profile (IGSID -> username & display name)
   */
  async getUserProfile({ igScopedId, userId }) {
    if (!igScopedId) return null;
    const creds = await this.getCredentials(userId);
    if (!creds || !creds.pageAccessToken) return null;

    try {
      const profileUrl = `${GRAPH_BASE_URL}/${igScopedId}?fields=name,username,profile_pic&access_token=${creds.pageAccessToken}`;
      const secureUrl = appendAppSecretProof(profileUrl, creds.pageAccessToken);
      const res = await fetch(secureUrl);
      const data = await res.json();
      if (res.ok && !data.error) {
        return {
          name: data.name || data.username || 'Instagram User',
          username: data.username || '',
          profilePic: data.profile_pic || null,
        };
      }
    } catch (e) {
      // Profile API access can be restricted based on permissions
    }
    return null;
  },
};
