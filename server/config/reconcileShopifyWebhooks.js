import { query, pool } from './db.js';
import { config } from './index.js';
import { shopifyGraphService } from '../services/shopifyGraphService.js';

/**
 * Production Webhook Reconciliation Script
 * Reconciles Phase 1 webhooks for connected Shopify store(s) against Render.
 * Safely removes obsolete subscriptions (e.g. pointing to Vercel) and ensures
 * exactly one active subscription exists per topic pointing to Render.
 *
 * PRODUCTION SAFETY:
 * - NEVER prints access tokens, secrets, or database credentials.
 * - Only reports PRESENT / ABSENT for credentials.
 */
export async function reconcileShopifyWebhooks(targetShop = null) {
  console.log('\n=============================================================');
  console.log(' ARCO SHOPIFY WEBHOOK RECONCILIATION — PRODUCTION');
  console.log('=============================================================\n');

  const webhookBase = config.shopifyWebhookBaseUrl || 'https://arco-backend-ecbl.onrender.com';
  const targetWebhookUrl = `${webhookBase.replace(/\/+$/, '')}/api/shopify/webhooks`;

  console.log(`[Config] Target Webhook Destination: ${targetWebhookUrl}`);
  console.log(`[Config] Base URL Setting: ${config.shopifyWebhookBaseUrl || 'DEFAULT_RENDER'}`);

  try {
    let queryStr = 'SELECT id, user_id, shop_domain, shop_name, access_token, status, updated_at FROM shopify_integrations WHERE status = $1';
    const params = ['connected'];

    if (targetShop) {
      queryStr += ' AND shop_domain = $2';
      params.push(targetShop.trim().toLowerCase());
    }

    queryStr += ' ORDER BY updated_at DESC';

    const result = await query(queryStr, params);

    if (result.rows.length === 0) {
      console.log('[Notice] No connected Shopify stores found to reconcile.');
      return { success: true, count: 0, results: [] };
    }

    console.log(`[Notice] Found ${result.rows.length} connected store(s) to inspect.\n`);

    const storeResults = [];

    for (const row of result.rows) {
      const shopDomain = row.shop_domain;
      const hasToken = !!row.access_token;

      console.log(`-------------------------------------------------------------`);
      console.log(`Store: ${shopDomain}`);
      console.log(`Credential Status: [Offline Token: ${hasToken ? 'PRESENT' : 'ABSENT'}]`);

      if (!hasToken) {
        console.warn(`[Skip] Cannot reconcile store ${shopDomain}: Offline token is ABSENT.`);
        storeResults.push({ shopDomain, success: false, error: 'Token ABSENT' });
        continue;
      }

      console.log(`Reconciling webhooks to: ${targetWebhookUrl}...`);

      const reconcileResults = await shopifyGraphService.registerPhase1Webhooks({
        shopDomain,
        accessToken: row.access_token,
        webhookUrl: targetWebhookUrl,
      });

      console.log(`Reconciliation results for ${shopDomain}:`);
      for (const res of reconcileResults) {
        const status = res.success ? (res.reconciled ? 'RECONCILED (ALREADY ACTIVE)' : 'CREATED') : 'FAILED';
        console.log(`  - [${res.topic}]: ${status} ${res.error ? `(${res.error})` : ''}`);
      }

      storeResults.push({
        shopDomain,
        success: true,
        results: reconcileResults,
      });
    }

    console.log('\n=============================================================');
    console.log(' RECONCILIATION PROCESS COMPLETED');
    console.log('=============================================================\n');

    return { success: true, count: storeResults.length, results: storeResults };
  } catch (err) {
    console.error('[Error] Webhook reconciliation failed:', err.message);
    throw err;
  }
}

// Auto-run if executed directly via CLI
if (process.argv[1]?.endsWith('reconcileShopifyWebhooks.js')) {
  const shopArg = process.argv[2] || process.env.TARGET_SHOP || null;
  reconcileShopifyWebhooks(shopArg)
    .then(() => {
      if (pool) pool.end();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Fatal CLI Error:', err.message);
      if (pool) pool.end();
      process.exit(1);
    });
}
