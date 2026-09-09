-- ==============================================================================
-- Migration: 001_update_shopify_integrations.sql
-- Description: Safe, non-destructive migration for Shopify embedded app support
-- Target Table: shopify_integrations
-- Author: ARCO Communication Engineering
-- ==============================================================================

-- 1. Add missing lifecycle, identity, and token fields
ALTER TABLE shopify_integrations 
  ADD COLUMN IF NOT EXISTS shopify_shop_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS uninstalled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_error TEXT;

-- 2. Add unique constraint index on shop_domain to guarantee 1-to-1 shop domain integrity
CREATE UNIQUE INDEX IF NOT EXISTS idx_shopify_integrations_shop_domain 
  ON shopify_integrations(shop_domain);

-- 3. Add index on shopify_shop_id for fast webhook/API lookups
CREATE INDEX IF NOT EXISTS idx_shopify_integrations_shop_id 
  ON shopify_integrations(shopify_shop_id);
