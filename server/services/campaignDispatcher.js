import { pool, query } from '../config/db.js';
import { metaWhatsAppService } from './metaWhatsAppService.js';

// Set of campaign IDs currently being processed in this process
export const activeCampaignRuns = new Set();
let schedulerInterval = null;
let isPolling = false;

/**
 * Helper to interpolate variables from CSV or recipient fields
 */
function resolveVariables(variableMapping, recipient, rawCsv) {
  const resolved = {};
  Object.entries(variableMapping || {}).forEach(([varKey, mappingTarget]) => {
    const targetStr = String(mappingTarget).trim();
    let resolvedVal = null;

    if (rawCsv && typeof rawCsv === 'object') {
      const matchKey = Object.keys(rawCsv).find(
        (k) => k.toLowerCase() === targetStr.toLowerCase() || `{{${k.toLowerCase()}}}` === targetStr.toLowerCase()
      );
      if (matchKey && rawCsv[matchKey] !== undefined && rawCsv[matchKey] !== null) {
        resolvedVal = rawCsv[matchKey];
      }
    }

    if (resolvedVal === null) {
      const lower = targetStr.toLowerCase();
      if (lower === 'name' || lower === '{{name}}') {
        resolvedVal = recipient.name;
      } else if (lower === 'email' || lower === '{{email}}') {
        resolvedVal = recipient.email;
      } else if (lower === 'phone' || lower === '{{phone}}') {
        resolvedVal = recipient.phone;
      } else {
        resolvedVal = targetStr; // Static value
      }
    }

    resolved[varKey] = resolvedVal || '';
  });
  return resolved;
}

/**
 * Recover any stale processing rows (older than timeout, default 5 minutes)
 */
export async function recoverStaleProcessing(campaignId = null, timeoutMinutes = 5) {
  let sql = `
    UPDATE campaign_recipients
    SET status = 'pending', updated_at = CURRENT_TIMESTAMP
    WHERE status = 'processing'
      AND updated_at < CURRENT_TIMESTAMP - ($1 || ' minutes')::interval
  `;
  const params = [String(timeoutMinutes)];
  if (campaignId) {
    params.push(campaignId);
    sql += ` AND campaign_id = $${params.length}`;
  }
  const res = await query(sql, params);
  return res.rowCount || 0;
}

/**
 * Fail any pending recipients that are no longer opted in.
 * Checks both recipient.whatsapp_opted and contacts.whatsapp_opted.
 */
export async function failNonOptedRecipients(campaignId, client = null) {
  const runner = client ? client.query.bind(client) : query;
  const sql = `
    UPDATE campaign_recipients cr
    SET status = 'failed',
        failed_at = CURRENT_TIMESTAMP,
        error_message = 'WhatsApp opt-in missing',
        error_code = 'OPT_IN_REQUIRED',
        updated_at = CURRENT_TIMESTAMP
    WHERE cr.campaign_id = $1
      AND cr.status = 'pending'
      AND (
        cr.whatsapp_opted = false
        OR EXISTS (
          SELECT 1 FROM contacts c
          WHERE c.id = cr.contact_id AND c.whatsapp_opted = false
        )
      )
    RETURNING cr.id
  `;
  const res = await runner(sql, [campaignId]);
  return res.rows || [];
}

/**
 * Atomically claim the next batch of pending recipients for a campaign using FOR UPDATE SKIP LOCKED.
 * Commits and releases database connection BEFORE any Meta API HTTP call.
 */
export async function claimNextRecipientBatch(campaignId, batchSize = 10) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Recover any stale processing recipients for this campaign
    await client.query(
      `UPDATE campaign_recipients
       SET status = 'pending', updated_at = CURRENT_TIMESTAMP
       WHERE campaign_id = $1
         AND status = 'processing'
         AND updated_at < CURRENT_TIMESTAMP - INTERVAL '5 minutes'`,
      [campaignId]
    );

    // 2. Fail any pending recipients that are not opted in
    await failNonOptedRecipients(campaignId, client);

    // 3. Atomically select and lock eligible pending recipients
    const selectRes = await client.query(
      `SELECT cr.id, cr.campaign_id, cr.contact_id, cr.name, cr.phone, cr.email,
              cr.country_code, cr.whatsapp_opted, cr.csv_data, cr.batch_number
       FROM campaign_recipients cr
       WHERE cr.campaign_id = $1
         AND cr.status = 'pending'
         AND cr.whatsapp_opted = true
       ORDER BY cr.batch_number ASC, cr.id ASC
       LIMIT $2
       FOR UPDATE SKIP LOCKED`,
      [campaignId, Math.max(1, batchSize)]
    );

    const claimedRows = selectRes.rows;

    // 4. Mark claimed rows as 'processing'
    if (claimedRows.length > 0) {
      const claimedIds = claimedRows.map((r) => r.id);
      await client.query(
        `UPDATE campaign_recipients
         SET status = 'processing', updated_at = CURRENT_TIMESTAMP
         WHERE id = ANY($1::varchar[])`,
        [claimedIds]
      );
    }

    await client.query('COMMIT');
    return claimedRows;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Dispatch a batch of claimed recipients via Meta WhatsApp Cloud API.
 * Updates recipient status to 'sent' or 'failed' immediately after each attempt.
 */
export async function dispatchBatch(campaign, recipients) {
  if (!Array.isArray(recipients) || recipients.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const variableMapping = typeof campaign.variable_mapping === 'string'
    ? JSON.parse(campaign.variable_mapping || '{}')
    : (campaign.variable_mapping || {});

  let sentCount = 0;
  let failedCount = 0;

  for (const recipient of recipients) {
    const rawCsv = typeof recipient.csv_data === 'string'
      ? JSON.parse(recipient.csv_data || '{}')
      : (recipient.csv_data || {});

    const resolvedVariables = resolveVariables(variableMapping, recipient, rawCsv);

    try {
      const metaResult = await metaWhatsAppService.sendTemplateMessage({
        to: recipient.phone,
        templateName: campaign.template_name || 'promo_offer',
        languageCode: campaign.template_language || 'en_US',
        variables: resolvedVariables,
      });

      if (metaResult.success) {
        sentCount++;
        await query(
          `UPDATE campaign_recipients
           SET status = 'sent',
               sent_at = CURRENT_TIMESTAMP,
               meta_message_id = $1,
               error_message = NULL,
               error_code = NULL,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [metaResult.wamid || `wamid_${Date.now()}`, recipient.id]
        );
      } else {
        failedCount++;
        await query(
          `UPDATE campaign_recipients
           SET status = 'failed',
               failed_at = CURRENT_TIMESTAMP,
               error_message = $1,
               error_code = $2,
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $3`,
          [
            metaResult.error || metaResult.message || 'Meta API delivery failed',
            String(metaResult.errorCode || 'META_API_ERROR'),
            recipient.id,
          ]
        );
      }
    } catch (dispatchErr) {
      failedCount++;
      await query(
        `UPDATE campaign_recipients
         SET status = 'failed',
             failed_at = CURRENT_TIMESTAMP,
             error_message = $1,
             error_code = 'DISPATCH_EXCEPTION',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [dispatchErr.message || 'Dispatch exception', recipient.id]
      );
    }
  }

  return { sent: sentCount, failed: failedCount };
}

/**
 * Recalculate campaign statistics and update master campaign record.
 * Only marks campaign Completed, Partially Completed, or Failed once pending + processing === 0.
 */
export async function recalculateCampaignStats(campaignId) {
  const statsRes = await query(
    `SELECT
       COUNT(*) as total,
       COUNT(*) FILTER (WHERE status = 'pending') as pending,
       COUNT(*) FILTER (WHERE status = 'processing') as processing,
       COUNT(*) FILTER (WHERE status = 'sent') as sent,
       COUNT(*) FILTER (WHERE status IN ('delivered', 'read', 'replied')) as delivered,
       COUNT(*) FILTER (WHERE status IN ('read', 'replied')) as read,
       COUNT(*) FILTER (WHERE status = 'replied') as replied,
       COUNT(*) FILTER (WHERE status = 'failed') as failed
     FROM campaign_recipients
     WHERE campaign_id = $1`,
    [campaignId]
  );

  const stats = statsRes.rows[0];
  const total = parseInt(stats.total, 10);
  const pending = parseInt(stats.pending, 10);
  const processing = parseInt(stats.processing, 10);
  const delivered = parseInt(stats.delivered, 10);
  const read = parseInt(stats.read, 10);
  const replied = parseInt(stats.replied, 10);
  const failed = parseInt(stats.failed, 10);

  const remainingWork = pending + processing;
  const isCompleted = remainingWork === 0;

  let finalStatus = 'Sending';
  if (isCompleted) {
    if (failed === total && total > 0) {
      finalStatus = 'Failed';
    } else if (failed > 0) {
      finalStatus = 'Partially Completed';
    } else {
      finalStatus = 'Completed';
    }
  }

  await query(
    `UPDATE campaigns
     SET delivered = $1,
         read = $2,
         replied = $3,
         failure_count = $4,
         status = $5,
         sent_at = COALESCE(sent_at, CURRENT_TIMESTAMP),
         completed_at = CASE WHEN $6 = true THEN CURRENT_TIMESTAMP ELSE completed_at END,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $7`,
    [delivered, read, replied, failed, finalStatus, isCompleted, campaignId]
  );

  return {
    isCompleted,
    finalStatus,
    stats: {
      total,
      pending,
      processing,
      sent: parseInt(stats.sent, 10),
      delivered,
      read,
      replied,
      failed,
      remainingWork,
    },
  };
}

/**
 * Process an entire campaign in the background using small batches until no claimable rows remain.
 * Enforces in-process concurrency guard (activeCampaignRuns) so the same campaign is not run twice.
 */
export async function processCampaign(campaignId) {
  if (activeCampaignRuns.has(campaignId)) {
    console.log(`[Campaign Dispatcher] Campaign ${campaignId} is already actively running. Skipping duplicate trigger.`);
    return;
  }

  activeCampaignRuns.add(campaignId);
  try {
    const campRes = await query('SELECT * FROM campaigns WHERE id = $1', [campaignId]);
    if (campRes.rows.length === 0) return;
    const campaign = campRes.rows[0];

    // Ensure status is 'Sending'
    if (campaign.status !== 'Sending') {
      await query(
        `UPDATE campaigns
         SET status = 'Sending', sent_at = COALESCE(sent_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [campaignId]
      );
    }

    const batchSize = 10;
    let hasMore = true;

    while (hasMore) {
      const batch = await claimNextRecipientBatch(campaignId, batchSize);
      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      await dispatchBatch(campaign, batch);
      const { isCompleted } = await recalculateCampaignStats(campaignId);
      if (isCompleted) {
        hasMore = false;
        break;
      }
    }

    // Final calculation to ensure terminal status is stamped
    await recalculateCampaignStats(campaignId);
  } catch (err) {
    console.error(`[Campaign Dispatcher] Error processing campaign ${campaignId}:`, err);
  } finally {
    activeCampaignRuns.delete(campaignId);
  }
}

/**
 * Polls for scheduled campaigns that are due and resumes any interrupted 'Sending' campaigns.
 * Uses atomic row locking (FOR UPDATE SKIP LOCKED) to prevent duplicate runs across instances.
 */
export async function pollAndProcessDueCampaigns() {
  if (isPolling) return;
  isPolling = true;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Claim campaigns that are due
    const dueRes = await client.query(
      `SELECT c.id, c.status, c.scheduled_for
       FROM campaigns c
       WHERE c.status = 'Scheduled'
         AND (c.scheduled_for IS NULL OR c.scheduled_for <= CURRENT_TIMESTAMP)
       ORDER BY c.scheduled_for ASC NULLS FIRST
       LIMIT 20
       FOR UPDATE SKIP LOCKED`
    );

    const claimedCampaigns = dueRes.rows;

    // Transition any 'Scheduled' campaigns to 'Sending'
    for (const c of claimedCampaigns) {
      if (c.status === 'Scheduled') {
        await client.query(
          `UPDATE campaigns
           SET status = 'Sending', sent_at = COALESCE(sent_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [c.id]
        );
      }
    }

    await client.query('COMMIT');

    // Asynchronously dispatch the claimed campaigns
    for (const c of claimedCampaigns) {
      if (!activeCampaignRuns.has(c.id)) {
        setImmediate(() => {
          processCampaign(c.id).catch((err) =>
            console.error(`[Campaign Dispatcher] Background execution error on ${c.id}:`, err.message)
          );
        });
      }
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.warn('[Campaign Dispatcher] Polling iteration warning:', error.message);
  } finally {
    client.release();
    isPolling = false;
  }
}

/**
 * Start the periodic background poller
 */
export function startCampaignScheduler(intervalMs = 20000) {
  if (schedulerInterval) return schedulerInterval;

  // Run initial poll shortly after boot
  setTimeout(() => {
    pollAndProcessDueCampaigns().catch((err) =>
      console.warn('[Campaign Scheduler] Initial poll warning:', err.message)
    );
  }, 2000);

  schedulerInterval = setInterval(() => {
    pollAndProcessDueCampaigns().catch((err) =>
      console.warn('[Campaign Scheduler] Interval poll warning:', err.message)
    );
  }, intervalMs);

  if (schedulerInterval.unref) {
    schedulerInterval.unref(); // Prevent keeping Node process alive during standalone scripts
  }

  console.log(`[Campaign Scheduler] Background poller started (interval: ${intervalMs}ms).`);
  return schedulerInterval;
}

/**
 * Stop the periodic background poller
 */
export function stopCampaignScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[Campaign Scheduler] Background poller stopped.');
  }
}
