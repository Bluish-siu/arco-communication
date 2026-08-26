import { query } from '../config/db.js';

// City/State Pincode Resolver Helper
function resolvePincode(pincode) {
  const pin = String(pincode).trim();
  const prefix = pin.substring(0, 2);
  switch (prefix) {
    case '56':
    case '57':
    case '58':
    case '59':
      return { city: 'Bengaluru', state: 'Karnataka' };
    case '40':
    case '41':
    case '42':
    case '43':
    case '44':
      return { city: 'Mumbai', state: 'Maharashtra' };
    case '11':
      return { city: 'New Delhi', state: 'Delhi' };
    case '60':
    case '61':
    case '62':
    case '63':
    case '64':
      return { city: 'Chennai', state: 'Tamil Nadu' };
    case '70':
    case '71':
    case '72':
    case '73':
      return { city: 'Kolkata', state: 'West Bengal' };
    case '50':
    case '51':
    case '52':
    case '53':
      return { city: 'Hyderabad', state: 'Telangana' };
    case '38':
    case '39':
      return { city: 'Ahmedabad', state: 'Gujarat' };
    default:
      return { city: 'Metro Region', state: 'India' };
  }
}

// Variable Interpolation Helper
function interpolateMessage(template, vars = {}) {
  let msg = template || '';
  Object.keys(vars).forEach((key) => {
    const reg = new RegExp(`\\{${key}\\}`, 'gi');
    msg = msg.replace(reg, vars[key] !== undefined ? vars[key] : '');
  });
  return msg;
}

// Compute Dynamic Order Totals
function calculateTotals(subtotal, shippingConfig) {
  const sub = parseFloat(subtotal) || 0;
  const freeThreshold = parseFloat(shippingConfig?.freeShippingThreshold) || 0;
  const defaultCharge = parseFloat(shippingConfig?.defaultShippingCharge) || 0;

  let shipping = (freeThreshold > 0 && sub >= freeThreshold) ? 0 : defaultCharge;
  let discount = 0;

  if (shippingConfig?.discountType === 'percentage' && shippingConfig?.discountValue > 0) {
    discount = (sub * parseFloat(shippingConfig.discountValue)) / 100;
  } else if (shippingConfig?.discountType === 'fixed' && shippingConfig?.discountValue > 0) {
    discount = parseFloat(shippingConfig.discountValue);
  }

  const finalTotal = Math.max(0, sub + shipping - discount);

  return {
    subtotal: sub,
    shippingCharge: shipping,
    discount,
    finalTotal,
  };
}

export const checkoutBotController = {
  // GET /api/checkout-bot (or /api/checkout-bot/workflow)
  getWorkflow: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';

      let wfRes = await query('SELECT * FROM checkout_workflows WHERE user_id = $1 LIMIT 1', [userId]);

      if (wfRes.rows.length === 0) {
        await query(`
          INSERT INTO checkout_workflows (
            id, user_id, name, status, trigger_config,
            cart_confirmation_msg, cancellation_msg, shipping_config, payment_config,
            order_confirmation_msg, order_placed_msg, step_count
          ) VALUES (
            $1, $2, 'Auto Checkout Flow', 'draft',
            '{"type": "cart_received", "sampleCartCount": 4, "sampleCartValue": 12000}',
            'Thanks for your cart! We currently deliver for free all over India.\n\nYour total Order Value = {total_order_value}.\n\nWould you like to proceed?',
            'No problem! Your cart has not been placed. Let us know if you need any assistance.',
            '{"freeShippingThreshold": 0, "defaultShippingCharge": 0, "discountType": "percentage", "discountValue": 0}',
            '{"codEnabled": true, "onlineEnabled": false, "paymentMode": "COD"}',
            'Thanks for providing the details!\n\nWe have noted your address as:\n{address}, {city}, {pincode}\n\nPayment Mode: {payment_method}\nTotal Amount: {total_order_value}\n\nWould you like to confirm your order?',
            '🎉 Your Order is Placed!\n\nHey {customer_name},\nThanks for confirming! Order ID: #{order_id}.\n\nWe are getting your order ready and will send tracking details soon.',
            3
          )
        `, [`wf_autocheckout_${userId}`, userId]);

        wfRes = await query('SELECT * FROM checkout_workflows WHERE user_id = $1 LIMIT 1', [userId]);
      }

      const wf = wfRes.rows[0];

      // Parse JSONB fields
      const formatted = {
        id: wf.id,
        userId: wf.user_id,
        name: wf.name,
        status: wf.status,
        publishedAt: wf.published_at,
        triggerConfig: typeof wf.trigger_config === 'string' ? JSON.parse(wf.trigger_config) : wf.trigger_config,
        cartConfirmationMsg: wf.cart_confirmation_msg,
        cancellationMsg: wf.cancellation_msg,
        shippingConfig: typeof wf.shipping_config === 'string' ? JSON.parse(wf.shipping_config) : wf.shipping_config,
        paymentConfig: typeof wf.payment_config === 'string' ? JSON.parse(wf.payment_config) : wf.payment_config,
        orderConfirmationMsg: wf.order_confirmation_msg,
        orderPlacedMsg: wf.order_placed_msg,
        stepCount: wf.step_count || 3,
        createdAt: wf.created_at,
        updatedAt: wf.updated_at,
      };

      res.json({ success: true, data: formatted });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/checkout-bot/status
  getStatus: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';

      // 1. Check Catalog Connection
      const commRes = await query('SELECT catalog_id, catalog_status, catalog_name FROM commerce_settings WHERE user_id = $1 LIMIT 1', [userId]);
      const catalogConnected = commRes.rows.length > 0 && commRes.rows[0].catalog_status === 'connected' && !!commRes.rows[0].catalog_id;
      const catalogId = commRes.rows[0]?.catalog_id || null;

      // 2. Check Workflow Status
      const wfRes = await query('SELECT * FROM checkout_workflows WHERE user_id = $1 LIMIT 1', [userId]);
      const workflow = wfRes.rows[0];
      const isLive = workflow?.status === 'live';

      // 3. Calculate Steps Remaining
      let remainingSteps = 0;
      if (!catalogConnected) remainingSteps++;
      if (!workflow?.cart_confirmation_msg || !workflow?.shipping_config) remainingSteps++;
      if (!workflow?.payment_config) remainingSteps++;

      // 4. Analytics Summary
      const ordersRes = await query('SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM checkout_orders WHERE user_id = $1', [userId]);
      const sessionsRes = await query('SELECT COUNT(*) as count FROM checkout_sessions WHERE user_id = $1', [userId]);

      res.json({
        success: true,
        data: {
          catalogConnected,
          catalogId,
          catalogName: commRes.rows[0]?.catalog_name || 'ARCO Catalog',
          workflowStatus: workflow?.status || 'draft',
          isLive,
          remainingSteps,
          totalSteps: 3,
          stats: {
            totalSessions: parseInt(sessionsRes.rows[0]?.count || 0, 10),
            completedOrders: parseInt(ordersRes.rows[0]?.count || 0, 10),
            totalRevenue: parseFloat(ordersRes.rows[0]?.revenue || 0),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/checkout-bot
  updateWorkflow: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const {
        name,
        triggerConfig,
        cartConfirmationMsg,
        cancellationMsg,
        shippingConfig,
        paymentConfig,
        orderConfirmationMsg,
        orderPlacedMsg,
      } = req.body;

      const updates = [];
      const values = [];

      if (name !== undefined) {
        updates.push(`name = $${updates.length + 1}`);
        values.push(name);
      }
      if (triggerConfig !== undefined) {
        updates.push(`trigger_config = $${updates.length + 1}`);
        values.push(JSON.stringify(triggerConfig));
      }
      if (cartConfirmationMsg !== undefined) {
        updates.push(`cart_confirmation_msg = $${updates.length + 1}`);
        values.push(cartConfirmationMsg);
      }
      if (cancellationMsg !== undefined) {
        updates.push(`cancellation_msg = $${updates.length + 1}`);
        values.push(cancellationMsg);
      }
      if (shippingConfig !== undefined) {
        updates.push(`shipping_config = $${updates.length + 1}`);
        values.push(JSON.stringify(shippingConfig));
      }
      if (paymentConfig !== undefined) {
        updates.push(`payment_config = $${updates.length + 1}`);
        values.push(JSON.stringify(paymentConfig));
      }
      if (orderConfirmationMsg !== undefined) {
        updates.push(`order_confirmation_msg = $${updates.length + 1}`);
        values.push(orderConfirmationMsg);
      }
      if (orderPlacedMsg !== undefined) {
        updates.push(`order_placed_msg = $${updates.length + 1}`);
        values.push(orderPlacedMsg);
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');
      values.push(userId);

      const sql = `UPDATE checkout_workflows SET ${updates.join(', ')} WHERE user_id = $${values.length} RETURNING *`;
      const result = await query(sql, values);

      res.json({
        success: true,
        message: 'Checkout Bot workflow configuration saved',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/checkout-bot/publish (Set Live)
  publishWorkflow: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';

      // 1. Verify Catalog is connected
      const commRes = await query('SELECT catalog_id, catalog_status FROM commerce_settings WHERE user_id = $1 LIMIT 1', [userId]);
      if (!commRes.rows[0]?.catalog_id || commRes.rows[0]?.catalog_status !== 'connected') {
        return res.status(400).json({
          success: false,
          error: 'Cannot publish workflow: Please connect a Facebook Catalog first in Commerce Settings.',
        });
      }

      const result = await query(
        `UPDATE checkout_workflows 
         SET status = 'live', published_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $1 
         RETURNING *`,
        [userId]
      );

      res.json({
        success: true,
        message: 'Auto Checkout Flow is now LIVE and active on WhatsApp!',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/checkout-bot/unpublish (Pause Workflow)
  unpublishWorkflow: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';

      const result = await query(
        `UPDATE checkout_workflows 
         SET status = 'paused', updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = $1 
         RETURNING *`,
        [userId]
      );

      res.json({
        success: true,
        message: 'Auto Checkout Flow has been paused.',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/checkout-bot/test (Execute Step or Full Flow Simulator)
  testWorkflow: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const {
        action, // 'START' | 'RESPOND' | 'RESET'
        sessionId,
        customerInput,
        sampleCart,
      } = req.body;

      // Fetch active workflow configuration
      const wfRes = await query('SELECT * FROM checkout_workflows WHERE user_id = $1 LIMIT 1', [userId]);
      const wf = wfRes.rows[0];
      const shippingConfig = typeof wf.shipping_config === 'string' ? JSON.parse(wf.shipping_config) : wf.shipping_config;
      const paymentConfig = typeof wf.payment_config === 'string' ? JSON.parse(wf.payment_config) : wf.payment_config;

      // 1. START: Initialize Checkout Session
      if (action === 'START' || !sessionId) {
        const cartItems = sampleCart?.items || [
          { id: 'prod_101', title: 'Urban Runner Pro Sneakers', price: 3499, qty: 1 },
          { id: 'prod_104', title: 'Organic Cotton Classic Tee', price: 899, qty: 2 },
        ];
        const subtotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * (item.qty || 1)), 0);
        const totals = calculateTotals(subtotal, shippingConfig);

        const newSessionId = `test_sess_${Date.now()}`;
        const initialCollected = {
          customer_name: '',
          pincode: '',
          city: '',
          state: '',
          address: '',
          payment_method: paymentConfig.paymentMode || 'COD',
          subtotal: totals.subtotal,
          shipping_charge: totals.shippingCharge,
          discount: totals.discount,
          total_order_value: `₹${totals.finalTotal.toLocaleString('en-IN')}`,
          final_total: totals.finalTotal,
          cart_item_count: cartItems.reduce((acc, i) => acc + (i.qty || 1), 0),
        };

        const initialMsg = interpolateMessage(wf.cart_confirmation_msg, initialCollected);

        // Save session in PostgreSQL
        await query(
          `INSERT INTO checkout_sessions (
             id, user_id, phone_number, cart_id, workflow_id, current_state, cart_data, collected_data, status
           ) VALUES ($1, $2, '+91 98765 43210', 'cart_sample_01', $3, 'WAITING_CART_CONFIRMATION', $4, $5, 'active')`,
          [newSessionId, userId, wf.id, JSON.stringify({ items: cartItems, subtotal }), JSON.stringify(initialCollected)]
        );

        return res.json({
          success: true,
          data: {
            sessionId: newSessionId,
            currentState: 'WAITING_CART_CONFIRMATION',
            botReply: initialMsg,
            options: ['Yes', 'No'],
            collectedData: initialCollected,
          },
        });
      }

      // 2. RESPOND: Advance state machine
      const sessionRes = await query('SELECT * FROM checkout_sessions WHERE id = $1 AND user_id = $2', [sessionId, userId]);
      if (sessionRes.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Session not found or expired' });
      }

      const session = sessionRes.rows[0];
      const collected = typeof session.collected_data === 'string' ? JSON.parse(session.collected_data) : session.collected_data;
      const cleanInput = String(customerInput || '').trim();
      const lowerInput = cleanInput.toLowerCase();

      let nextState = session.current_state;
      let botReply = '';
      let options = [];
      let orderCreated = null;

      switch (session.current_state) {
        case 'WAITING_CART_CONFIRMATION':
          if (['yes', 'y', 'proceed', 'sure', 'confirm', 'ok', 'okay'].includes(lowerInput)) {
            nextState = 'COLLECTING_NAME';
            botReply = 'Great! Please provide your full name for delivery.';
            options = [];
          } else if (['no', 'n', 'cancel', 'stop', 'dont'].includes(lowerInput)) {
            nextState = 'CANCELLED';
            botReply = interpolateMessage(wf.cancellation_msg, collected);
            options = [];
          } else {
            botReply = 'Please reply with "Yes" to proceed with your order or "No" to cancel.';
            options = ['Yes', 'No'];
          }
          break;

        case 'COLLECTING_NAME':
          if (cleanInput.length < 2) {
            botReply = 'Please provide a valid full name.';
          } else {
            collected.customer_name = cleanInput;
            nextState = 'COLLECTING_PINCODE';
            botReply = `Thanks ${cleanInput}! Please provide the 6-digit Pincode of your delivery location.`;
          }
          break;

        case 'COLLECTING_PINCODE':
          const pincodeDigits = cleanInput.replace(/[^0-9]/g, '');
          if (pincodeDigits.length !== 6) {
            botReply = 'Please enter a valid 6-digit Indian Pincode (e.g. 560001).';
          } else {
            const loc = resolvePincode(pincodeDigits);
            collected.pincode = pincodeDigits;
            collected.city = loc.city;
            collected.state = loc.state;
            nextState = 'COLLECTING_ADDRESS';
            botReply = `Got it (${loc.city}, ${loc.state})! Please enter your street address, building name, flat number, floor etc.`;
          }
          break;

        case 'COLLECTING_ADDRESS':
          if (cleanInput.length < 5) {
            botReply = 'Please provide complete house/street address details.';
          } else {
            collected.address = cleanInput;
            nextState = 'CONFIRMING_ORDER';
            botReply = interpolateMessage(wf.order_confirmation_msg, collected);
            options = ['Yes', 'No', 'Change Address'];
          }
          break;

        case 'CONFIRMING_ORDER':
          if (['yes', 'y', 'confirm', 'place order', 'proceed'].includes(lowerInput)) {
            nextState = 'ORDER_PLACED';
            const orderNumber = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
            collected.order_id = orderNumber;

            const cartData = typeof session.cart_data === 'string' ? JSON.parse(session.cart_data) : session.cart_data;

            // Insert into checkout_orders
            const orderRes = await query(
              `INSERT INTO checkout_orders (
                 id, order_number, user_id, session_id, customer_name, phone_number,
                 items, subtotal, shipping_charge, discount, total_amount, pincode,
                 city, state, address, payment_method, payment_status, order_status, workflow_id
               ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'CONFIRMED', $18)
               RETURNING *`,
              [
                `ord_${Date.now()}`,
                orderNumber,
                userId,
                session.id,
                collected.customer_name,
                session.phone_number,
                JSON.stringify(cartData?.items || []),
                collected.subtotal || 0,
                collected.shipping_charge || 0,
                collected.discount || 0,
                collected.final_total || collected.subtotal || 0,
                collected.pincode,
                collected.city,
                collected.state,
                collected.address,
                collected.payment_method || 'COD',
                collected.payment_method === 'COD' ? 'COD' : 'PENDING',
                wf.id,
              ]
            );

            orderCreated = orderRes.rows[0];
            botReply = interpolateMessage(wf.order_placed_msg, collected);
            options = [];
          } else if (['no', 'n', 'cancel'].includes(lowerInput)) {
            nextState = 'CANCELLED';
            botReply = interpolateMessage(wf.cancellation_msg, collected);
            options = [];
          } else if (['change address', 'change', 'edit'].includes(lowerInput)) {
            nextState = 'COLLECTING_PINCODE';
            botReply = 'Let\'s update your delivery address. Please provide the 6-digit Pincode.';
            options = [];
          } else {
            botReply = 'Please reply with "Yes" to confirm your order or "Change Address" to edit details.';
            options = ['Yes', 'No', 'Change Address'];
          }
          break;

        default:
          botReply = 'This checkout session has already concluded. Send a new cart anytime to start again!';
          break;
      }

      // Update session state in PostgreSQL
      await query(
        `UPDATE checkout_sessions 
         SET current_state = $1, collected_data = $2, status = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [nextState, JSON.stringify(collected), nextState === 'ORDER_PLACED' ? 'completed' : (nextState === 'CANCELLED' ? 'cancelled' : 'active'), sessionId]
      );

      res.json({
        success: true,
        data: {
          sessionId,
          currentState: nextState,
          botReply,
          options,
          collectedData: collected,
          orderCreated,
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/checkout-bot/sessions
  getSessions: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const result = await query(
        'SELECT * FROM checkout_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
        [userId]
      );
      res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/checkout-bot/orders
  getOrders: async (req, res, next) => {
    try {
      const userId = req.user?.id || 'usr_1';
      const result = await query(
        'SELECT * FROM checkout_orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
        [userId]
      );
      res.json({ success: true, count: result.rows.length, data: result.rows });
    } catch (error) {
      next(error);
    }
  },
};
