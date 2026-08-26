import crypto from 'crypto';
import { query } from '../config/db.js';

export const commerceOrderController = {
  // GET /api/commerce/orders
  getOrders: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const {
        page = 1,
        limit = 20,
        dateRange = 'all',
        orderStatus = 'All',
        paymentStatus = 'All',
        fulfillmentStatus = 'All',
        search = '',
        sort = 'newest',
      } = req.query;

      const pageNum = Math.max(1, parseInt(page, 10));
      const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
      const offset = (pageNum - 1) * limitNum;

      const conditions = ['user_id = $1'];
      const values = [userId];

      // 1. Date Range Filter
      const now = new Date();
      if (dateRange === 'today') {
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        conditions.push(`created_at >= $${values.length + 1}`);
        values.push(startOfToday);
      } else if (dateRange === 'yesterday') {
        const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        conditions.push(`created_at >= $${values.length + 1} AND created_at < $${values.length + 2}`);
        values.push(startOfYesterday.toISOString(), endOfYesterday.toISOString());
      } else if (dateRange === 'last7') {
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
        conditions.push(`created_at >= $${values.length + 1}`);
        values.push(sevenDaysAgo);
      } else if (dateRange === 'last30') {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
        conditions.push(`created_at >= $${values.length + 1}`);
        values.push(thirtyDaysAgo);
      }

      // 2. Order Status Filter
      if (orderStatus && orderStatus !== 'All') {
        conditions.push(`LOWER(order_status) = LOWER($${values.length + 1})`);
        values.push(orderStatus);
      }

      // 3. Payment Status Filter
      if (paymentStatus && paymentStatus !== 'All') {
        conditions.push(`LOWER(payment_status) = LOWER($${values.length + 1})`);
        values.push(paymentStatus);
      }

      // 4. Fulfillment Status Filter
      if (fulfillmentStatus && fulfillmentStatus !== 'All') {
        conditions.push(`LOWER(COALESCE(fulfillment_status, 'unfulfilled')) = LOWER($${values.length + 1})`);
        values.push(fulfillmentStatus);
      }

      // 5. Search Filter
      if (search && String(search).trim()) {
        const s = `%${String(search).trim()}%`;
        conditions.push(`(customer_name ILIKE $${values.length + 1} OR phone_number ILIKE $${values.length + 1} OR order_number ILIKE $${values.length + 1})`);
        values.push(s);
      }

      // Count Total Matching Records
      const whereClause = conditions.join(' AND ');
      const countSql = `SELECT COUNT(*) FROM checkout_orders WHERE ${whereClause}`;
      const countRes = await query(countSql, values);
      const total = parseInt(countRes.rows[0].count, 10) || 0;
      const totalPages = Math.ceil(total / limitNum);

      // Sorting
      let orderBy = 'created_at DESC';
      if (sort === 'oldest') orderBy = 'created_at ASC';
      else if (sort === 'highest') orderBy = 'total_amount DESC';
      else if (sort === 'lowest') orderBy = 'total_amount ASC';

      // Query Records
      const dataSql = `
        SELECT * FROM checkout_orders 
        WHERE ${whereClause} 
        ORDER BY ${orderBy} 
        LIMIT $${values.length + 1} OFFSET $${values.length + 2}
      `;
      const dataValues = [...values, limitNum, offset];
      const dataRes = await query(dataSql, dataValues);

      res.json({
        success: true,
        orders: dataRes.rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/commerce/orders/:orderId
  getOrderById: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { orderId } = req.params;

      const result = await query(
        'SELECT * FROM checkout_orders WHERE (id = $1 OR order_number = $1) AND user_id = $2 LIMIT 1',
        [orderId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/commerce/orders/:orderId/status
  updateOrderStatus: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const { orderId } = req.params;
      const { orderStatus, paymentStatus, fulfillmentStatus } = req.body;

      const updates = [];
      const values = [];

      if (orderStatus !== undefined) {
        updates.push(`order_status = $${updates.length + 1}`);
        values.push(orderStatus);
      }
      if (paymentStatus !== undefined) {
        updates.push(`payment_status = $${updates.length + 1}`);
        values.push(paymentStatus);
      }
      if (fulfillmentStatus !== undefined) {
        updates.push(`fulfillment_status = $${updates.length + 1}`);
        values.push(fulfillmentStatus);
      }

      if (updates.length === 0) {
        return res.status(400).json({ success: false, error: 'No status update fields provided' });
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(orderId, userId);

      const sql = `
        UPDATE checkout_orders 
        SET ${updates.join(', ')} 
        WHERE (id = $${values.length - 1} OR order_number = $${values.length - 1}) AND user_id = $${values.length}
        RETURNING *
      `;

      const result = await query(sql, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Order not found or update unauthorized' });
      }

      res.json({
        success: true,
        message: 'Order status updated successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/commerce/orders/export
  exportOrdersCsv: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const {
        dateRange = 'all',
        orderStatus = 'All',
        paymentStatus = 'All',
        fulfillmentStatus = 'All',
        search = '',
      } = req.query;

      const conditions = ['user_id = $1'];
      const values = [userId];

      if (orderStatus && orderStatus !== 'All') {
        conditions.push(`LOWER(order_status) = LOWER($${values.length + 1})`);
        values.push(orderStatus);
      }
      if (paymentStatus && paymentStatus !== 'All') {
        conditions.push(`LOWER(payment_status) = LOWER($${values.length + 1})`);
        values.push(paymentStatus);
      }
      if (fulfillmentStatus && fulfillmentStatus !== 'All') {
        conditions.push(`LOWER(COALESCE(fulfillment_status, 'unfulfilled')) = LOWER($${values.length + 1})`);
        values.push(fulfillmentStatus);
      }
      if (search && String(search).trim()) {
        const s = `%${String(search).trim()}%`;
        conditions.push(`(customer_name ILIKE $${values.length + 1} OR phone_number ILIKE $${values.length + 1} OR order_number ILIKE $${values.length + 1})`);
        values.push(s);
      }

      const whereClause = conditions.join(' AND ');
      const result = await query(`SELECT * FROM checkout_orders WHERE ${whereClause} ORDER BY created_at DESC`, values);

      // Build CSV String
      const headers = [
        'Order ID',
        'Customer Name',
        'Customer Phone',
        'Customer Email',
        'Cart Date',
        'Order Date',
        'Items Count',
        'Subtotal',
        'Shipping',
        'Discount',
        'Total Amount',
        'Payment Method',
        'Payment Status',
        'Order Status',
        'Fulfillment Status',
        'Delivery Address',
        'City',
        'State',
        'Pincode',
      ];

      const rows = result.rows.map((o) => {
        const items = Array.isArray(o.items) ? o.items : JSON.parse(o.items || '[]');
        const itemsCount = items.reduce((acc, i) => acc + (i.qty || 1), 0);
        return [
          `"${o.order_number}"`,
          `"${o.customer_name || ''}"`,
          `"${o.phone_number || ''}"`,
          `"${o.customer_email || ''}"`,
          `"${new Date(o.cart_date || o.created_at).toISOString().split('T')[0]}"`,
          `"${new Date(o.created_at).toISOString().split('T')[0]}"`,
          itemsCount,
          parseFloat(o.subtotal || 0).toFixed(2),
          parseFloat(o.shipping_charge || 0).toFixed(2),
          parseFloat(o.discount || 0).toFixed(2),
          parseFloat(o.total_amount || 0).toFixed(2),
          `"${o.payment_method || 'COD'}"`,
          `"${o.payment_status || 'COD'}"`,
          `"${o.order_status || 'Confirmed'}"`,
          `"${o.fulfillment_status || 'Unfulfilled'}"`,
          `"${(o.address || '').replace(/"/g, '""')}"`,
          `"${o.city || ''}"`,
          `"${o.state || ''}"`,
          `"${o.pincode || ''}"`,
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="ARCO_Orders_${Date.now()}.csv"`);
      res.send(csvContent);
    } catch (error) {
      next(error);
    }
  },

  // GET /api/commerce/orders/webhooks (Webhook Config)
  getWebhookConfig: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      let whkRes = await query('SELECT * FROM commerce_webhooks WHERE user_id = $1 LIMIT 1', [userId]);

      if (whkRes.rows.length === 0) {
        await query(`
          INSERT INTO commerce_webhooks (id, user_id, webhook_url, secret_key, events, is_active)
          VALUES (
            $1, $2, 'https://api.arco-crm.com/v1/webhooks/orders',
            'whsec_arco_live_' || md5(random()::text),
            '["order.created", "order.confirmed", "order.cancelled", "order.paid", "order.shipped", "order.delivered"]',
            true
          )
        `, [`whk_${userId}`, userId]);

        whkRes = await query('SELECT * FROM commerce_webhooks WHERE user_id = $1 LIMIT 1', [userId]);
      }

      const whk = whkRes.rows[0];
      res.json({
        success: true,
        data: {
          webhookUrl: whk.webhook_url,
          secretKey: whk.secret_key,
          events: typeof whk.events === 'string' ? JSON.parse(whk.events) : whk.events,
          isActive: whk.is_active,
          createdAt: whk.created_at,
          updatedAt: whk.updated_at,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/commerce/orders/webhooks/regenerate
  regenerateWebhookSecret: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const newSecret = `whsec_arco_live_${crypto.randomBytes(16).toString('hex')}`;

      const result = await query(
        'UPDATE commerce_webhooks SET secret_key = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 RETURNING *',
        [newSecret, userId]
      );

      res.json({
        success: true,
        message: 'Webhook signing secret regenerated successfully',
        data: {
          secretKey: newSecret,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/commerce/webhooks/orders (Receive External Order Webhook)
  receiveOrderWebhook: async (req, res) => {
    try {
      const payload = req.body;
      console.log('[Order Webhook Ingest Received]:', JSON.stringify(payload));
      res.status(200).json({ success: true, message: 'Order webhook processed' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};
