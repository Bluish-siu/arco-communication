-- ==============================================================================
-- Migration: 002_add_waba_id_to_whatsapp_templates.sql
-- Description: Safe, idempotent migration to add waba_id to whatsapp_templates
-- Target Table: whatsapp_templates
-- Author: ARCO Communication Engineering
-- ==============================================================================

-- 1. Idempotently add waba_id column if not exists
ALTER TABLE whatsapp_templates
  ADD COLUMN IF NOT EXISTS waba_id VARCHAR(255);

-- 2. Idempotently add index on waba_id for fast WABA queries
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_waba_id 
  ON whatsapp_templates(waba_id);
