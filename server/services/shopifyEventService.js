import crypto from 'crypto';
import { query } from '../config/db.js';
import { metaWhatsAppService, formatPhoneNumber } from './metaWhatsAppService.js';
import { workflowExecutionEngine } from './workflowExecutionEngine.js';

/**
 * Normalizes Shopify webhook topics and payloads into standard ARCO event types.
 *
 * Supported event types:
 * - customer.created, customer.updated, customer.deleted
 * - product.created, product.updated, product.deleted
 * - order.created, order.updated, order.paid, order.fulfilled, order.cancelled
 */
export function mapTopicToEventType(topic, payload = {}) {
  const cleanTopic = (topic || '').toLowerCase().trim();

  switch (cleanTopic) {
    case 'customers/create':
      return 'customer.created';
    case 'customers/update':
      return 'customer.updated';
    case 'customers/delete':
      return 'customer.deleted';

    case 'products/create':
      return 'product.created';
    case 'products/update':
      return 'product.updated';
    case 'products/delete':
      return 'product.deleted';

    case 'orders/create':
      return 'order.created';

    case 'orders/paid':
      return 'order.paid';

    case 'orders/fulfilled':
      return 'order.fulfilled';

    case 'orders/cancelled':
      return 'order.cancelled';

    case 'orders/updated':
      // Differentiate granular order lifecycle events from payload status
      if (payload?.cancelled_at) {
        return 'order.cancelled';
      }
      if (payload?.fulfillment_status === 'fulfilled') {
        return 'order.fulfilled';
      }
      if (payload?.financial_status === 'paid') {
        return 'order.paid';
      }
      return 'order.updated';

    default:
      // Topic fallback (e.g. app/uninstalled)
      return cleanTopic.replace('/', '.');
  }
}

/**
 * Extracts structured, typed variables from Shopify payloads for template
 * rendering and condition node evaluations.
 */
export function extractShopifyVariables(eventType, payload = {}) {
  const vars = {};

  if (!payload || typeof payload !== 'object') {
    return vars;
  }

  // Base raw payload fields for custom expressions
  vars.raw_id = payload.id ? String(payload.id) : '';

  if (eventType.startsWith('order.')) {
    const customer = payload.customer || {};
    const shipping = payload.shipping_address || {};
    const billing = payload.billing_address || {};

    const firstName = customer.first_name || shipping.first_name || '';
    const lastName = customer.last_name || shipping.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || shipping.name || customer.email || 'Customer';

    const phone = payload.phone || customer.phone || shipping.phone || billing.phone || '';
    const email = payload.email || customer.email || '';

    const totalAmount = parseFloat(payload.total_price || 0);
    const subtotal = parseFloat(payload.subtotal_price || 0);
    const discount = parseFloat(payload.total_discounts || 0);
    const tax = parseFloat(payload.total_tax || 0);
    const currency = String(payload.currency || payload.presentment_currency || 'INR').toUpperCase();

    const lineItems = Array.isArray(payload.line_items) ? payload.line_items.map((item) => ({
      id: String(item.id || ''),
      title: item.title || item.name || 'Product',
      quantity: parseInt(item.quantity || 1, 10),
      price: parseFloat(item.price || 0),
      sku: item.sku || '',
      variant_title: item.variant_title || '',
    })) : [];

    const itemsSummary = lineItems.map((item) => `${item.title} (x${item.quantity})`).join(', ');

    Object.assign(vars, {
      order_id: String(payload.id || ''),
      order_number: String(payload.order_number || payload.name || payload.id || ''),
      total_amount: totalAmount,
      total_price: totalAmount,
      subtotal,
      discount,
      tax,
      currency,
      financial_status: String(payload.financial_status || 'pending').toLowerCase(),
      fulfillment_status: String(payload.fulfillment_status || 'unfulfilled').toLowerCase(),
      customer_id: customer.id ? String(customer.id) : '',
      customer_name: fullName,
      first_name: firstName,
      last_name: lastName,
      customer_email: email,
      customer_phone: phone,
      email,
      phone,
      line_items: lineItems,
      line_items_count: lineItems.length,
      items_summary: itemsSummary,
      gateway: payload.gateway || '',
      tags: payload.tags ? payload.tags.split(',').map((t) => t.trim()) : [],
    });
  } else if (eventType.startsWith('customer.')) {
    const firstName = payload.first_name || '';
    const lastName = payload.last_name || '';
    const fullName = `${firstName} ${lastName}`.trim() || payload.email || 'Customer';
    const phone = payload.phone || payload.default_address?.phone || '';
    const email = payload.email || '';

    const consentState = payload.sms_marketing_consent?.state
      ? String(payload.sms_marketing_consent.state).toLowerCase()
      : (typeof payload.accepts_marketing === 'boolean' ? (payload.accepts_marketing ? 'subscribed' : 'unsubscribed') : 'unknown');

    Object.assign(vars, {
      customer_id: String(payload.id || ''),
      first_name: firstName,
      last_name: lastName,
      name: fullName,
      customer_name: fullName,
      email,
      phone,
      customer_email: email,
      customer_phone: phone,
      tags: payload.tags ? payload.tags.split(',').map((t) => t.trim()) : [],
      marketing_consent: consentState,
      sms_consent: consentState,
      orders_count: parseInt(payload.orders_count || 0, 10),
      total_spent: parseFloat(payload.total_spent || 0),
      currency: String(payload.currency || 'INR').toUpperCase(),
    });
  } else if (eventType.startsWith('product.')) {
    const firstVariant = Array.isArray(payload.variants) && payload.variants.length > 0 ? payload.variants[0] : {};
    const price = parseFloat(firstVariant.price || 0);

    Object.assign(vars, {
      product_id: String(payload.id || ''),
      title: payload.title || '',
      vendor: payload.vendor || '',
      product_type: payload.product_type || '',
      status: String(payload.status || 'active').toLowerCase(),
      sku: firstVariant.sku || '',
      price,
      variants_count: Array.isArray(payload.variants) ? payload.variants.length : 0,
      tags: payload.tags ? payload.tags.split(',').map((t) => t.trim()) : [],
    });
  }

  return vars;
}

/**
 * Normalizes an incoming Shopify webhook into a standard ARCO event envelope.
 */
export function normalizeShopifyEvent({
  topic,
  shopDomain,
  webhookId,
  payload,
  userId,
  integrationId = null,
  shopifyShopId = null,
}) {
  const eventType = mapTopicToEventType(topic, payload);
  const cleanShop = (shopDomain || '').toLowerCase().trim();
  const rawId = payload?.id ? String(payload.id) : 'unknown';
  const nowIso = new Date().toISOString();

  // Deterministic or unique event identifier
  const deterministicPart = `${cleanShop}_${eventType}_${rawId}_${webhookId || Date.now()}`;
  const eventHash = crypto.createHash('sha256').update(deterministicPart).digest('hex').slice(0, 16);
  const eventId = `evt_shp_${eventHash}`;

  const occurredAt = payload?.updated_at || payload?.created_at || nowIso;
  const variables = extractShopifyVariables(eventType, payload);

  return {
    eventId,
    eventType,
    source: 'shopify',
    shopDomain: cleanShop,
    shopifyShopId: shopifyShopId ? String(shopifyShopId) : null,
    integrationId: integrationId ? String(integrationId) : null,
    userId: String(userId),
    occurredAt,
    webhookId: webhookId ? String(webhookId) : null,
    payload,
    variables,
  };
}

/**
 * Persists normalized Shopify event into PostgreSQL `shopify_events` table
 * with strict deduplication on `webhook_id` and `event_id`.
 *
 * @returns {Promise<{ isDuplicate: boolean, event: Object }>}
 */
export async function persistShopifyEvent(normalizedEvent) {
  const {
    eventId,
    eventType,
    source,
    integrationId,
    userId,
    shopDomain,
    webhookId,
    payload,
    variables,
  } = normalizedEvent;

  // 1. Check if webhook_id already exists (deduplication check)
  if (webhookId) {
    const existingRes = await query(
      'SELECT id, event_id, event_type, status, attempts, created_at FROM shopify_events WHERE webhook_id = $1 LIMIT 1',
      [webhookId]
    );

    if (existingRes.rows.length > 0) {
      return {
        isDuplicate: true,
        event: existingRes.rows[0],
      };
    }
  }

  // 2. Insert event with unique constraint protection
  const eventDbId = `sevt_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const fullPayload = {
    ...payload,
    __arco_variables: variables,
  };

  try {
    const insertRes = await query(
      `INSERT INTO shopify_events (
         id, event_id, event_type, source, integration_id, user_id, shop_domain, webhook_id, payload, status, attempts, created_at, updated_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'received', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (webhook_id) DO NOTHING
       RETURNING id, event_id, event_type, user_id, shop_domain, webhook_id, status, created_at`,
      [
        eventDbId,
        eventId,
        eventType,
        source || 'shopify',
        integrationId,
        userId,
        shopDomain,
        webhookId,
        JSON.stringify(fullPayload),
      ]
    );

    if (insertRes.rows.length === 0) {
      // Conflict occurred on webhook_id
      const conflictRes = await query(
        'SELECT id, event_id, event_type, status, attempts, created_at FROM shopify_events WHERE webhook_id = $1 LIMIT 1',
        [webhookId]
      );
      return {
        isDuplicate: true,
        event: conflictRes.rows[0] || { event_id: eventId },
      };
    }

    return {
      isDuplicate: false,
      event: insertRes.rows[0],
    };
  } catch (err) {
    // If unique constraint on event_id or webhook_id tripped
    if (err.code === '23505') {
      return {
        isDuplicate: true,
        event: { event_id: eventId, webhook_id: webhookId },
      };
    }
    throw err;
  }
}

/**
 * Updates event execution lifecycle status in shopify_events.
 */
export async function updateEventStatus(eventId, status, { error = null, attempts = null } = {}) {
  try {
    let updateSql = 'UPDATE shopify_events SET status = $1, updated_at = CURRENT_TIMESTAMP';
    const params = [status];

    if (status === 'processed') {
      updateSql += ', processed_at = CURRENT_TIMESTAMP';
    }

    if (error !== null) {
      params.push(error);
      updateSql += `, error = $${params.length}`;
    }

    if (attempts !== null) {
      params.push(attempts);
      updateSql += `, attempts = $${params.length}`;
    } else {
      updateSql += ', attempts = attempts + 1';
    }

    params.push(eventId);
    updateSql += ` WHERE event_id = $${params.length} OR id = $${params.length}`;

    await query(updateSql, params);
  } catch (err) {
    console.warn(`[Shopify Event Status Update Warning]:`, err.message);
  }
}

/**
 * Evaluates a condition node against normalized event variables.
 * Supports all 11 ARCO CONDITION_OPERATORS.
 */
export function evaluateConditionRule(cond, variables = {}) {
  if (!cond) return true;

  const trait = (cond.trait || cond.workflowVar || cond.field || '').toLowerCase().trim();
  const operator = (cond.operator || 'equal').toLowerCase().trim();
  const targetValue = cond.value !== undefined ? cond.value : '';

  // Resolve variable value from variables map (case-insensitive lookup)
  let actualValue = variables[trait];
  if (actualValue === undefined) {
    const matchedKey = Object.keys(variables).find((k) => k.toLowerCase() === trait);
    if (matchedKey) actualValue = variables[matchedKey];
  }

  // Operator evaluation
  switch (operator) {
    case 'equal':
    case '==':
    case 'is':
      if (typeof actualValue === 'number') {
        return actualValue === parseFloat(targetValue);
      }
      return String(actualValue ?? '').toLowerCase() === String(targetValue).toLowerCase();

    case 'not equal':
    case '!=':
      if (typeof actualValue === 'number') {
        return actualValue !== parseFloat(targetValue);
      }
      return String(actualValue ?? '').toLowerCase() !== String(targetValue).toLowerCase();

    case 'contains':
      return String(actualValue ?? '').toLowerCase().includes(String(targetValue).toLowerCase());

    case 'not contains':
      return !String(actualValue ?? '').toLowerCase().includes(String(targetValue).toLowerCase());

    case 'starts with':
      return String(actualValue ?? '').toLowerCase().startsWith(String(targetValue).toLowerCase());

    case 'not starts with':
      return !String(actualValue ?? '').toLowerCase().startsWith(String(targetValue).toLowerCase());

    case 'greater than':
    case '>': {
      const numAct = parseFloat(actualValue);
      const numTarget = parseFloat(targetValue);
      if (isNaN(numAct) || isNaN(numTarget)) return false;
      return numAct > numTarget;
    }

    case 'less than':
    case '<': {
      const numAct = parseFloat(actualValue);
      const numTarget = parseFloat(targetValue);
      if (isNaN(numAct) || isNaN(numTarget)) return false;
      return numAct < numTarget;
    }

    case 'is empty':
    case 'is_empty':
      return actualValue === null || actualValue === undefined || String(actualValue).trim() === '';

    case 'is not empty':
    case 'is_not_empty':
      return actualValue !== null && actualValue !== undefined && String(actualValue).trim() !== '';

    case 'one of':
    case 'in': {
      const allowed = String(targetValue).split(',').map((v) => v.trim().toLowerCase());
      return allowed.includes(String(actualValue ?? '').toLowerCase());
    }

    default:
      return true;
  }
}

/**
 * Checks if a workflow trigger definition matches an incoming Shopify event.
 */
export function isWorkflowTriggerMatch(workflow, normalizedEvent) {
  if (!workflow) return false;

  const eventType = normalizedEvent.eventType;
  const triggerConfig = workflow.trigger_config || {};
  const triggerStr = (workflow.trigger || '').toLowerCase().trim();

  // 1. Explicit source validation if configured
  if (triggerConfig.source && triggerConfig.source.toLowerCase() !== 'shopify') {
    return false;
  }
  if (triggerConfig.type && triggerConfig.type.toLowerCase() !== 'shopify' && triggerConfig.type.toLowerCase() !== 'webhook') {
    return false;
  }

  // 2. Shop domain binding (if specified in workflow trigger_config)
  if (triggerConfig.shopDomain && triggerConfig.shopDomain !== '*' && triggerConfig.shopDomain.toLowerCase() !== normalizedEvent.shopDomain) {
    return false;
  }

  // 3. Event Type matching
  // A. trigger_config.event or event_type matches (e.g. { event: 'order.created' } or { event_type: 'order.created' })
  const configuredEvent = triggerConfig.event || triggerConfig.event_type;
  if (configuredEvent && configuredEvent.toLowerCase() === eventType.toLowerCase()) {
    return true;
  }

  // B. Exact eventType match in trigger string
  if (triggerStr === eventType.toLowerCase() || triggerStr === `shopify:${eventType.toLowerCase()}`) {
    return true;
  }

  // C. Human-readable trigger string match
  const humanEventMap = {
    'order.created': ['order created', 'shopify: order created', 'new order'],
    'order.updated': ['order updated', 'shopify: order updated'],
    'order.paid': ['order paid', 'shopify: order paid', 'payment successful'],
    'order.fulfilled': ['order fulfilled', 'shopify: order fulfilled', 'order shipped'],
    'order.cancelled': ['order cancelled', 'shopify: order cancelled'],
    'customer.created': ['customer created', 'shopify: customer created', 'new customer'],
    'customer.updated': ['customer updated', 'shopify: customer updated'],
    'product.created': ['product created', 'shopify: product created', 'new product'],
    'product.updated': ['product updated', 'shopify: product updated'],
  };

  const aliases = humanEventMap[eventType] || [];
  if (aliases.some((alias) => triggerStr.includes(alias))) {
    return true;
  }

  // D. Generic 'shopify' trigger with event in trigger_config
  if ((triggerStr === 'shopify' || triggerStr === 'shopify webhook') && (triggerConfig.event === eventType || triggerConfig.event_type === eventType)) {
    return true;
  }

  return false;
}

/**
 * Replaces {{variable_name}} tokens in text with values from normalized variables.
 */
export function interpolateVariables(templateText, variables = {}) {
  if (!templateText || typeof templateText !== 'string') return '';
  return templateText.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, token) => {
    const key = token.toLowerCase();
    const val = variables[key];
    if (val !== undefined && val !== null) {
      if (typeof val === 'number' && (key.includes('amount') || key.includes('price') || key.includes('total'))) {
        return val.toFixed(2);
      }
      return String(val);
    }
    return match;
  });
}

/**
 * Executes a matched workflow for a normalized Shopify event.
 * Evaluates condition nodes and routes to downstream action nodes.
 */
export async function executeWorkflowForShopifyEvent(workflow, normalizedEvent) {
  const { eventId, eventType, userId, variables, shopDomain } = normalizedEvent;

  const targetPhone = variables.customer_phone || variables.phone || null;

  const context = {
    userId,
    channel: 'shopify',
    triggerType: 'shopify_event',
    triggerEvent: eventType,
    contact: {
      phone: targetPhone,
      name: variables.customer_name || 'Customer',
    },
    variables,
    isSimulation: false,
    metadata: { eventId, shopDomain },
  };

  const result = await workflowExecutionEngine.executeWorkflow(workflow, context);

  return {
    workflowId: workflow.id,
    workflowName: workflow.name,
    executedAction: `Executed Shopify Workflow: ${eventType}`,
    steps: result.executionSteps,
    executionSteps: result.executionSteps,
    success: result.success,
    executionResult: result,
    result,
  };
}

/**
 * Main dispatcher: Matches a normalized Shopify event against active tenant
 * workflows and executes them sequentially.
 */
export async function dispatchShopifyEventToWorkflows(normalizedEvent) {
  const { eventId, eventType, userId, shopDomain } = normalizedEvent;

  try {
    // Update event status to 'processing'
    await updateEventStatus(eventId, 'processing');

    // 1. Fetch active workflows for this tenant strictly
    const wfRes = await query(
      `SELECT id, user_id, name, trigger, trigger_config, nodes, edges, status, executions, is_published 
       FROM workflows 
       WHERE user_id = $1 AND status = 'active' AND is_published != false`,
      [userId]
    );

    const activeWorkflows = wfRes.rows;
    const matchingWorkflows = activeWorkflows.filter((wf) => isWorkflowTriggerMatch(wf, normalizedEvent));

    if (matchingWorkflows.length === 0) {
      // Mark event as processed (no matching workflows required execution)
      await updateEventStatus(eventId, 'processed');
      return {
        matchedCount: 0,
        results: [],
      };
    }

    const executionResults = [];
    for (const wf of matchingWorkflows) {
      try {
        const res = await executeWorkflowForShopifyEvent(wf, normalizedEvent);
        executionResults.push(res);
      } catch (wfErr) {
        console.error(`[Workflow Execution Error on ${wf.name}]:`, wfErr.message);
        executionResults.push({
          workflowId: wf.id,
          workflowName: wf.name,
          error: wfErr.message,
        });
      }
    }

    // Mark event as processed
    await updateEventStatus(eventId, 'processed');

    return {
      matchedCount: matchingWorkflows.length,
      executedCount: executionResults.length,
      results: executionResults,
    };
  } catch (err) {
    console.error(`[Shopify Event Dispatch Error for ${eventId}]:`, err.message);
    await updateEventStatus(eventId, 'failed', { error: err.message });
    throw err;
  }
}

/**
 * Retry helper: Re-processes failed Shopify events for a given tenant.
 */
export async function retryFailedShopifyEvents(userId, maxAttempts = 3) {
  try {
    const failedRes = await query(
      `SELECT id, event_id, event_type, source, integration_id, user_id, shop_domain, webhook_id, payload, attempts 
       FROM shopify_events 
       WHERE user_id = $1 AND status = 'failed' AND attempts < $2 
       ORDER BY created_at ASC LIMIT 10`,
      [userId, maxAttempts]
    );

    const retryResults = [];
    for (const row of failedRes.rows) {
      const rawPayload = typeof row.payload === 'string' ? JSON.parse(row.payload) : (row.payload || {});
      const normalized = normalizeShopifyEvent({
        topic: row.event_type.replace('.', '/'),
        shopDomain: row.shop_domain,
        webhookId: row.webhook_id,
        payload: rawPayload,
        userId: row.user_id,
        integrationId: row.integration_id,
      });

      const res = await dispatchShopifyEventToWorkflows(normalized);
      retryResults.push({ eventId: row.event_id, success: true, res });
    }

    return retryResults;
  } catch (err) {
    console.error(`[Shopify Event Retry Error]:`, err.message);
    throw err;
  }
}

export const shopifyEventService = {
  mapTopicToEventType,
  extractShopifyVariables,
  normalizeShopifyEvent,
  persistShopifyEvent,
  updateEventStatus,
  evaluateConditionRule,
  isWorkflowTriggerMatch,
  interpolateVariables,
  executeWorkflowForShopifyEvent,
  dispatchShopifyEventToWorkflows,
  retryFailedShopifyEvents,
};
