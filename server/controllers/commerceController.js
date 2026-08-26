import { query } from '../config/db.js';

// Helper to parse standard CSV text with quoted values
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  // Parse header line
  const parseLine = (line) => {
    const values = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(cur.trim().replace(/^["']|["']$/g, ''));
        cur = '';
      } else {
        cur += char;
      }
    }
    values.push(cur.trim().replace(/^["']|["']$/g, ''));
    return values;
  };

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().trim().replace(/\s+/g, '_'));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseLine(lines[i]);
    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] !== undefined ? values[idx] : '';
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

export const commerceController = {
  // GET /api/commerce/settings
  getSettings: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';

      // 1. Fetch settings record
      let settingsRes = await query('SELECT * FROM commerce_settings WHERE user_id = $1 LIMIT 1', [userId]);

      if (settingsRes.rows.length === 0) {
        // Create default record if not exists
        await query(`
          INSERT INTO commerce_settings (
            id, user_id, catalog_id, catalog_name, catalog_status, connected_at,
            message_settings, campaign_settings, auto_reply_settings, autocheckout_settings
          ) VALUES (
            $1, $2, 'cat_9082410291', 'ARCO Official Storefront Catalog', 'connected', CURRENT_TIMESTAMP,
            '{"title": "Explore our Latest Products", "body": "Browse our complete store catalog and place orders directly on WhatsApp with free delivery.", "cta": "View Catalog", "enabled": true}',
            '{"catalogId": "cat_9082410291", "campaignName": "Spring Launch Collection", "enabled": true}',
            '{"keywords": ["catalog", "products", "price", "menu", "store", "buy"], "replyText": "Here is our product catalogue! Tap below to view items and place your order.", "enabled": true}',
            '{"enabled": true, "paymentMode": "cod_and_upi", "orderConfirmationMsg": "Thank you for your order! Our team will process and ship your items shortly."}'
          )
        `, [`comm_settings_${userId}`, userId]);

        settingsRes = await query('SELECT * FROM commerce_settings WHERE user_id = $1 LIMIT 1', [userId]);
      }

      const settings = settingsRes.rows[0];

      // 2. Count active products
      const countRes = await query('SELECT COUNT(*) FROM catalog_products WHERE user_id = $1 AND is_active = true', [userId]);
      const productCount = parseInt(countRes.rows[0].count, 10) || 0;

      res.json({
        success: true,
        data: {
          id: settings.id,
          catalogConnected: settings.catalog_status === 'connected',
          catalogId: settings.catalog_id,
          catalogName: settings.catalog_name || 'ARCO WhatsApp Catalog',
          catalogStatus: settings.catalog_status,
          productCount,
          connectedAt: settings.connected_at,
          messageSettings: typeof settings.message_settings === 'string' ? JSON.parse(settings.message_settings) : settings.message_settings,
          campaignSettings: typeof settings.campaign_settings === 'string' ? JSON.parse(settings.campaign_settings) : settings.campaign_settings,
          autoReplySettings: typeof settings.auto_reply_settings === 'string' ? JSON.parse(settings.auto_reply_settings) : settings.auto_reply_settings,
          autocheckoutSettings: typeof settings.autocheckout_settings === 'string' ? JSON.parse(settings.autocheckout_settings) : settings.autocheckout_settings,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/commerce/catalog/connect
  connectCatalog: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { catalogId, catalogName } = req.body;

      if (!catalogId || !String(catalogId).trim()) {
        return res.status(400).json({ success: false, error: 'Facebook Catalog ID is required' });
      }

      const cleanCatalogId = String(catalogId).trim();
      const cleanName = catalogName || `Facebook Catalog (${cleanCatalogId})`;

      const result = await query(
        `UPDATE commerce_settings 
         SET catalog_id = $1, catalog_name = $2, catalog_status = 'connected', connected_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $3
         RETURNING *`,
        [cleanCatalogId, cleanName, userId]
      );

      res.json({
        success: true,
        message: 'Facebook Catalog connected successfully',
        data: {
          catalogConnected: true,
          catalogId: cleanCatalogId,
          catalogName: cleanName,
          catalogStatus: 'connected',
          connectedAt: result.rows[0]?.connected_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/commerce/catalog/disconnect
  disconnectCatalog: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';

      await query(
        `UPDATE commerce_settings 
         SET catalog_id = NULL, catalog_status = 'disconnected', connected_at = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [userId]
      );

      res.json({
        success: true,
        message: 'Facebook Catalog disconnected successfully',
        data: {
          catalogConnected: false,
          catalogId: null,
          catalogStatus: 'disconnected',
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/commerce/catalog/upload-csv
  uploadCsv: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { csvContent, products: rawProducts } = req.body;

      let itemsToProcess = [];

      if (csvContent && typeof csvContent === 'string') {
        const parsed = parseCSV(csvContent);
        const REQUIRED_HEADERS = ['id', 'title', 'price'];
        const missing = REQUIRED_HEADERS.filter((rh) => !parsed.headers.includes(rh));

        if (missing.length > 0) {
          return res.status(400).json({
            success: false,
            error: `CSV is missing required columns: ${missing.join(', ')}. Required headers are: id, title, description, price, availability, image_link, brand`,
          });
        }

        itemsToProcess = parsed.rows;
      } else if (Array.isArray(rawProducts) && rawProducts.length > 0) {
        itemsToProcess = rawProducts;
      } else {
        return res.status(400).json({ success: false, error: 'No CSV content or product records provided.' });
      }

      if (itemsToProcess.length === 0) {
        return res.status(400).json({ success: false, error: 'CSV file contains no product data rows.' });
      }

      let imported = 0;
      let updated = 0;
      let failed = 0;
      const errors = [];

      for (let i = 0; i < itemsToProcess.length; i++) {
        const item = itemsToProcess[i];
        const extId = item.id || item.external_product_id || item.sku;
        const title = item.title || item.name;
        const description = item.description || item.desc || '';
        const priceNum = parseFloat(String(item.price || '0').replace(/[^0-9.]/g, ''));
        const availability = item.availability || 'in stock';
        const imageLink = item.image_link || item.image || item.image_url || '';
        const brand = item.brand || 'ARCO';

        if (!extId || !title) {
          failed++;
          errors.push(`Row ${i + 1}: Missing ID or Title`);
          continue;
        }

        if (isNaN(priceNum) || priceNum < 0) {
          failed++;
          errors.push(`Row ${i + 1}: Invalid price "${item.price}"`);
          continue;
        }

        const internalId = `prod_csv_${Date.now()}_${i}`;

        // Check if existing product with same external_product_id exists
        const existing = await query(
          'SELECT id FROM catalog_products WHERE user_id = $1 AND external_product_id = $2',
          [userId, extId]
        );

        if (existing.rows.length > 0) {
          await query(
            `UPDATE catalog_products 
             SET title = $1, description = $2, price = $3, availability = $4, image_link = $5, brand = $6, updated_at = CURRENT_TIMESTAMP
             WHERE id = $7`,
            [title, description, priceNum, availability, imageLink, brand, existing.rows[0].id]
          );
          updated++;
        } else {
          await query(
            `INSERT INTO catalog_products (
               id, user_id, external_product_id, title, description, price, availability, image_link, brand, catalog_id, is_active
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'cat_csv', true)`,
            [internalId, userId, extId, title, description, priceNum, availability, imageLink, brand]
          );
          imported++;
        }
      }

      // Query new total product count
      const countRes = await query('SELECT COUNT(*) FROM catalog_products WHERE user_id = $1 AND is_active = true', [userId]);
      const totalProductCount = parseInt(countRes.rows[0].count, 10) || 0;

      res.json({
        success: true,
        message: `Successfully processed ${itemsToProcess.length} products (${imported} imported, ${updated} updated, ${failed} failed).`,
        data: {
          imported,
          updated,
          failed,
          total: totalProductCount,
          errors,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/commerce/products
  getProducts: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const result = await query(
        `SELECT id, external_product_id, title, description, price, availability, image_link, brand, catalog_id, created_at, updated_at
         FROM catalog_products
         WHERE user_id = $1 AND is_active = true
         ORDER BY updated_at DESC, created_at DESC`,
        [userId]
      );

      res.json({
        success: true,
        count: result.rows.length,
        data: result.rows,
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/commerce/settings
  updateSettings: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { messageSettings, campaignSettings, autoReplySettings, autocheckoutSettings } = req.body;

      const updates = [];
      const values = [];

      if (messageSettings !== undefined) {
        updates.push(`message_settings = $${updates.length + 1}`);
        values.push(JSON.stringify(messageSettings));
      }
      if (campaignSettings !== undefined) {
        updates.push(`campaign_settings = $${updates.length + 1}`);
        values.push(JSON.stringify(campaignSettings));
      }
      if (autoReplySettings !== undefined) {
        updates.push(`auto_reply_settings = $${updates.length + 1}`);
        values.push(JSON.stringify(autoReplySettings));
      }
      if (autocheckoutSettings !== undefined) {
        updates.push(`autocheckout_settings = $${updates.length + 1}`);
        values.push(JSON.stringify(autocheckoutSettings));
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(userId);

      const sql = `UPDATE commerce_settings SET ${updates.join(', ')} WHERE user_id = $${values.length} RETURNING *`;
      const result = await query(sql, values);

      res.json({
        success: true,
        message: 'Commerce settings saved successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/commerce/products/:id
  deleteProduct: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { id } = req.params;

      const result = await query(
        'DELETE FROM catalog_products WHERE id = $1 AND user_id = $2 RETURNING id',
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      // Count remaining products
      const countRes = await query('SELECT COUNT(*) FROM catalog_products WHERE user_id = $1 AND is_active = true', [userId]);
      const remainingCount = parseInt(countRes.rows[0].count, 10) || 0;

      res.json({
        success: true,
        message: 'Product deleted successfully',
        data: {
          deletedId: id,
          remainingCount,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
