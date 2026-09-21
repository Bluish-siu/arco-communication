import crypto from 'crypto';
import { query } from '../config/db.js';
import { shopifyGraphService } from './shopifyGraphService.js';
import { decryptTokenWithFallback } from '../utils/crypto.js';
import {
  handleCustomerSync,
  handleProductSync,
  handleOrderSync,
} from '../controllers/shopifyWebhookController.js';

/**
 * Shopify Historical & Bulk Data Synchronization Service
 * 
 * Supports cursor-paginated initial and historical data imports for:
 * 1. Customers (with marketing consent mapping to contacts)
 * 2. Products (with catalog variants and active stock status)
 * 3. Orders (with line items, currency preservation, and contact association)
 * 
 * SAFETY & ISOLATION GUARANTEES:
 * - Completely bypasses shopify_events and workflow triggers (isNewOrder = false).
 * - Idempotent upserts ensure repeated sync runs produce no duplicates.
 * - Saves pagination cursors per batch to support resume after interruption.
 * - Strictly tenant-scoped (user_id + integration_id validation).
 * - Access tokens are decrypted in memory only and never logged or exposed.
 */
export const shopifySyncService = {
  /**
   * Creates a new sync job or returns an existing running job for this store.
   */
  createSyncJob: async ({ userId, integrationId, shopDomain, syncType = 'full' }) => {
    if (!userId || !shopDomain) {
      throw new Error('User ID and shop domain are required to create a sync job');
    }

    // 1. Check for any active (running or queued) job for this tenant/store
    const activeRes = await query(
      `SELECT * FROM shopify_sync_jobs 
       WHERE user_id = $1 AND shop_domain = $2 AND status IN ('running', 'queued') 
       ORDER BY created_at DESC LIMIT 1`,
      [userId, shopDomain]
    );

    if (activeRes.rows.length > 0) {
      return {
        job: activeRes.rows[0],
        isExisting: true,
      };
    }

    const jobId = `sync_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const initialStage = syncType === 'products' ? 'products' : syncType === 'orders' ? 'orders' : 'customers';

    const initialProgress = {
      customers: { processed: 0, total: null },
      products: { processed: 0, total: null },
      orders: { processed: 0, total: null },
    };

    const insertRes = await query(
      `INSERT INTO shopify_sync_jobs (
         id, integration_id, user_id, shop_domain, sync_type, status, current_stage,
         cursor, stage_progress, processed_count, total_count, error, started_at, completed_at, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, 'queued', $6, NULL, $7, 0, NULL, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [jobId, integrationId, userId, shopDomain, syncType, initialStage, JSON.stringify(initialProgress)]
    );

    return {
      job: insertRes.rows[0],
      isExisting: false,
    };
  },

  /**
   * Retrieves the latest sync job for a specific tenant user
   */
  getLatestJob: async (userId) => {
    if (!userId) return null;
    const res = await query(
      `SELECT * FROM shopify_sync_jobs 
       WHERE user_id = $1 
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );
    return res.rows[0] || null;
  },

  /**
   * Retrieves a specific sync job by ID, ensuring tenant ownership
   */
  getJobById: async (jobId, userId) => {
    if (!jobId || !userId) return null;
    const res = await query(
      'SELECT * FROM shopify_sync_jobs WHERE id = $1 AND user_id = $2 LIMIT 1',
      [jobId, userId]
    );
    return res.rows[0] || null;
  },

  /**
   * Cancels an active or queued sync job
   */
  cancelSyncJob: async (jobId, userId) => {
    const job = await shopifySyncService.getJobById(jobId, userId);
    if (!job) {
      throw new Error('Sync job not found or unauthorized');
    }

    if (job.status === 'completed' || job.status === 'cancelled') {
      return job;
    }

    const res = await query(
      `UPDATE shopify_sync_jobs 
       SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [jobId, userId]
    );

    return res.rows[0];
  },

  /**
   * Executes or resumes a sync job asynchronously.
   * Can be called directly or after job creation.
   */
  runSyncJob: async (jobId) => {
    // 1. Fetch job record
    const jobRes = await query('SELECT * FROM shopify_sync_jobs WHERE id = $1 LIMIT 1', [jobId]);
    if (!jobRes.rows.length) {
      throw new Error(`Sync job ${jobId} not found`);
    }

    let job = jobRes.rows[0];
    if (job.status === 'cancelled') {
      return job;
    }

    const { user_id: userId, shop_domain: shopDomain, sync_type: syncType } = job;

    // 2. Fetch integration and decrypt access token in memory
    const integRes = await query(
      "SELECT id, access_token, status FROM shopify_integrations WHERE shop_domain = $1 AND user_id = $2 AND status = 'connected' LIMIT 1",
      [shopDomain, userId]
    );

    if (!integRes.rows.length || !integRes.rows[0]?.access_token) {
      const errMsg = `Connected Shopify store not found or missing credentials for ${shopDomain}`;
      await query(
        `UPDATE shopify_sync_jobs SET status = 'failed', error = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [errMsg, jobId]
      );
      throw new Error(errMsg);
    }

    const accessToken = decryptTokenWithFallback(integRes.rows[0].access_token);
    if (!accessToken) {
      const errMsg = 'Unable to decrypt Shopify access token';
      await query(
        `UPDATE shopify_sync_jobs SET status = 'failed', error = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [errMsg, jobId]
      );
      throw new Error(errMsg);
    }

    // 3. Mark job as running
    await query(
      `UPDATE shopify_sync_jobs 
       SET status = 'running', started_at = COALESCE(started_at, CURRENT_TIMESTAMP), error = NULL, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [jobId]
    );

    // Determine stages to execute based on syncType
    const allStages = ['customers', 'products', 'orders'];
    let stagesToRun = [];

    if (syncType === 'full') {
      stagesToRun = allStages;
    } else if (allStages.includes(syncType)) {
      stagesToRun = [syncType];
    } else {
      stagesToRun = allStages;
    }

    // If resuming an interrupted job, start from current_stage
    const startingStageIdx = stagesToRun.indexOf(job.current_stage);
    if (startingStageIdx > 0) {
      stagesToRun = stagesToRun.slice(startingStageIdx);
    }

    try {
      for (const stage of stagesToRun) {
        // Update stage in database
        await query(
          `UPDATE shopify_sync_jobs SET current_stage = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [stage, jobId]
        );

        // Resume cursor if this is the starting interrupted stage, else start fresh
        let currentCursor = stage === job.current_stage ? (job.cursor || null) : null;
        let hasMore = true;

        while (hasMore) {
          // Check if job was cancelled
          const checkCancel = await query('SELECT status FROM shopify_sync_jobs WHERE id = $1', [jobId]);
          if (checkCancel.rows[0]?.status === 'cancelled') {
            console.log(`[Shopify Sync] Job ${jobId} was cancelled by user.`);
            return;
          }

          let pageResult;
          if (stage === 'customers') {
            pageResult = await shopifyGraphService.getCustomersPage({
              shopDomain,
              accessToken,
              first: 50,
              after: currentCursor,
            });

            for (const cust of pageResult.nodes) {
              await handleCustomerSync(shopDomain, cust);
            }
          } else if (stage === 'products') {
            pageResult = await shopifyGraphService.getProductsPage({
              shopDomain,
              accessToken,
              first: 50,
              after: currentCursor,
            });

            for (const prod of pageResult.nodes) {
              await handleProductSync(shopDomain, prod);
            }
          } else if (stage === 'orders') {
            pageResult = await shopifyGraphService.getOrdersPage({
              shopDomain,
              accessToken,
              first: 50,
              after: currentCursor,
            });

            for (const ord of pageResult.nodes) {
              // Historical order import strictly disables notification dispatch and workflow triggers
              await handleOrderSync(shopDomain, ord, { isNewOrder: false, isHistorical: true });
            }
          }

          const batchCount = pageResult.nodes.length;
          currentCursor = pageResult.pageInfo.endCursor;
          hasMore = pageResult.pageInfo.hasNextPage;

          // Update progress atomically
          const currentJobRes = await query('SELECT stage_progress, processed_count FROM shopify_sync_jobs WHERE id = $1', [jobId]);
          const currentProgress = currentJobRes.rows[0]?.stage_progress || {};
          const currentTotalProcessed = parseInt(currentJobRes.rows[0]?.processed_count || 0, 10) + batchCount;

          if (!currentProgress[stage]) currentProgress[stage] = { processed: 0, total: null };
          currentProgress[stage].processed = (currentProgress[stage].processed || 0) + batchCount;

          await query(
            `UPDATE shopify_sync_jobs 
             SET cursor = $1,
                 processed_count = $2,
                 stage_progress = $3,
                 updated_at = CURRENT_TIMESTAMP 
             WHERE id = $4`,
            [hasMore ? currentCursor : null, currentTotalProcessed, JSON.stringify(currentProgress), jobId]
          );

          // Pacing yield between pages
          if (hasMore) {
            await new Promise((resolve) => setTimeout(resolve, 80));
          }
        }
      }

      // Mark completed
      await query(
        `UPDATE shopify_sync_jobs 
         SET status = 'completed',
             current_stage = 'completed',
             cursor = NULL,
             completed_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        [jobId]
      );
      console.log(`[Shopify Sync] Historical sync job ${jobId} completed successfully.`);
    } catch (syncErr) {
      console.error(`[Shopify Sync Error on job ${jobId}]:`, syncErr.message);
      await query(
        `UPDATE shopify_sync_jobs 
         SET status = 'failed',
             error = $1,
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $2`,
        [syncErr.message, jobId]
      );
      throw syncErr;
    }
  },
};
