import { query } from './db.js';

/**
 * Migration & Index initialization for Phase 1: Multi-Tenant Data Isolation
 * Enforces composite indexes for high-speed tenant-scoped queries across
 * contacts, checkout_orders, catalog_products, and shopify_integrations.
 */
export async function initMultiTenantIsolationIndexes() {
  try {
    console.log('[PostgreSQL] Initializing Multi-Tenant Isolation Composite Indexes...');

    // 1. Composite index for tenant-scoped Shopify customer lookup
    await query(`
      CREATE INDEX IF NOT EXISTS idx_contacts_tenant_shopify_cust 
      ON contacts (user_id, (custom_attributes->>'shopify_customer_id'));
    `);

    // 2. Composite index for tenant-scoped email matching
    await query(`
      CREATE INDEX IF NOT EXISTS idx_contacts_tenant_email 
      ON contacts (user_id, LOWER(email));
    `);

    // 3. Composite index for tenant-scoped phone matching
    await query(`
      CREATE INDEX IF NOT EXISTS idx_contacts_tenant_phone 
      ON contacts (user_id, phone);
    `);

    // 4. Composite index for tenant-scoped order lookup by order_number
    await query(`
      CREATE INDEX IF NOT EXISTS idx_checkout_orders_tenant_order_num 
      ON checkout_orders (user_id, order_number);
    `);

    // 5. Composite index for tenant-scoped catalog product lookup by external_product_id
    await query(`
      CREATE INDEX IF NOT EXISTS idx_catalog_products_tenant_ext_id 
      ON catalog_products (user_id, external_product_id);
    `);

    // 6. Ensure shop_domain uniqueness constraint on shopify_integrations (one shop per ARCO system)
    await query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_shopify_integrations_shop_domain 
      ON shopify_integrations(shop_domain);
    `);

    console.log('[PostgreSQL] Multi-Tenant Isolation Indexes verified successfully.');
    return true;
  } catch (err) {
    console.error('[PostgreSQL] Failed to initialize Multi-Tenant Isolation Indexes:', err.message);
    return false;
  }
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith('initMultiTenantIsolationIndexes.js')) {
  initMultiTenantIsolationIndexes().then(() => process.exit(0));
}
