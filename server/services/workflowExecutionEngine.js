import crypto from 'crypto';
import { query } from '../config/db.js';
import { metaWhatsAppService, formatPhoneNumber } from './metaWhatsAppService.js';

/**
 * Normalizes variable tokens and resolves them from a dictionary of variables.
 * Handles tokens like {{name}}, {{Phone Number}}, {{order_number}}, {{deal_value}}.
 */
export function resolveVariables(templateText, variables = {}) {
  if (!templateText || typeof templateText !== 'string') return '';
  if (!variables || typeof variables !== 'object') return templateText;

  // Build a lowercased normalized key dictionary
  const normalizedVars = {};
  for (const [k, v] of Object.entries(variables)) {
    if (v !== undefined && v !== null) {
      const normKey = String(k).toLowerCase().replace(/[\s-]+/g, '_');
      normalizedVars[normKey] = v;
      normalizedVars[String(k).toLowerCase()] = v;
    }
  }

  return templateText.replace(/\{\{\s*([a-zA-Z0-9_ -]+)\s*\}\}/g, (match, token) => {
    const rawToken = token.trim();
    const cleanToken = rawToken.toLowerCase().replace(/[\s-]+/g, '_');

    let val = normalizedVars[cleanToken];
    if (val === undefined) {
      val = normalizedVars[rawToken.toLowerCase()];
    }

    if (val !== undefined && val !== null) {
      if (typeof val === 'number') {
        if (cleanToken.includes('amount') || cleanToken.includes('price') || cleanToken.includes('total') || cleanToken.includes('deal_value')) {
          return Number.isInteger(val) ? String(val) : val.toFixed(2);
        }
        return String(val);
      }
      return String(val);
    }

    // If token not found in context, return empty string for customer-facing safety
    return '';
  });
}

/**
 * Evaluates a single condition rule against variables.
 * Supports all 11 ARCO CONDITION_OPERATORS.
 */
export function evaluateConditionRule(cond, variables = {}) {
  if (!cond) return true;

  const trait = (cond.trait || cond.workflowVar || cond.field || '').toLowerCase().trim().replace(/[\s-]+/g, '_');
  const operator = (cond.operator || 'equal').toLowerCase().trim();
  const targetValue = cond.value !== undefined ? cond.value : '';

  // Case/format-insensitive resolution from variables dictionary
  let actualValue = variables[trait];
  if (actualValue === undefined) {
    const matchedKey = Object.keys(variables).find((k) => {
      const normK = k.toLowerCase().trim().replace(/[\s-]+/g, '_');
      return normK === trait || k.toLowerCase() === trait;
    });
    if (matchedKey) actualValue = variables[matchedKey];
  }

  // Operator evaluation
  switch (operator) {
    case 'equal':
    case '==':
    case 'is': {
      if (actualValue === null || actualValue === undefined) {
        return targetValue === '' || targetValue === null || targetValue === undefined;
      }
      const numAct = parseFloat(actualValue);
      const numTarget = parseFloat(targetValue);
      if (!isNaN(numAct) && !isNaN(numTarget) && String(actualValue).trim() !== '' && String(targetValue).trim() !== '') {
        return numAct === numTarget;
      }
      return String(actualValue).trim().toLowerCase() === String(targetValue).trim().toLowerCase();
    }

    case 'not equal':
    case '!=': {
      if (actualValue === null || actualValue === undefined) {
        return targetValue !== '' && targetValue !== null && targetValue !== undefined;
      }
      const numAct = parseFloat(actualValue);
      const numTarget = parseFloat(targetValue);
      if (!isNaN(numAct) && !isNaN(numTarget) && String(actualValue).trim() !== '' && String(targetValue).trim() !== '') {
        return numAct !== numTarget;
      }
      return String(actualValue).trim().toLowerCase() !== String(targetValue).trim().toLowerCase();
    }

    case 'contains':
      if (actualValue === null || actualValue === undefined) return false;
      return String(actualValue).toLowerCase().includes(String(targetValue).toLowerCase());

    case 'not contains':
      if (actualValue === null || actualValue === undefined) return true;
      return !String(actualValue).toLowerCase().includes(String(targetValue).toLowerCase());

    case 'starts with':
      if (actualValue === null || actualValue === undefined) return false;
      return String(actualValue).toLowerCase().startsWith(String(targetValue).toLowerCase());

    case 'not starts with':
      if (actualValue === null || actualValue === undefined) return true;
      return !String(actualValue).toLowerCase().startsWith(String(targetValue).toLowerCase());

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

    case 'greater than or equal':
    case '>=': {
      const numAct = parseFloat(actualValue);
      const numTarget = parseFloat(targetValue);
      if (isNaN(numAct) || isNaN(numTarget)) return false;
      return numAct >= numTarget;
    }

    case 'less than or equal':
    case '<=': {
      const numAct = parseFloat(actualValue);
      const numTarget = parseFloat(targetValue);
      if (isNaN(numAct) || isNaN(numTarget)) return false;
      return numAct <= numTarget;
    }

    case 'is empty':
    case 'is_empty':
      return actualValue === null || actualValue === undefined || String(actualValue).trim() === '';

    case 'is not empty':
    case 'is_not_empty':
      return actualValue !== null && actualValue !== undefined && String(actualValue).trim() !== '';

    case 'one of':
    case 'in': {
      if (actualValue === null || actualValue === undefined) return false;
      const allowed = String(targetValue)
        .split(',')
        .map((v) => v.trim().toLowerCase());
      return allowed.includes(String(actualValue).trim().toLowerCase());
    }

    default:
      return true;
  }
}

/**
 * Persists an outbound reply message into the messages table and updates conversations table
 */
async function persistOutboundReply({ conversationId, text, metaMessageId }) {
  if (!conversationId || !text) return;
  try {
    const newMsgId = `m_wf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    await query(
      `INSERT INTO messages (
         id, conversation_id, sender, text, time, meta_message_id,
         status, error_message, message_type, created_at
       ) VALUES (
         $1, $2, 'agent', $3, $4, $5,
         'sent', NULL, 'text', CURRENT_TIMESTAMP
       )`,
      [newMsgId, conversationId, text, timeStr, metaMessageId || null]
    );

    await query(
      `UPDATE conversations SET
         last_message_time = 'Just now',
         reply_status = 'replied',
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [conversationId]
    );
  } catch (err) {
    console.warn('[workflowExecutionEngine] Failed to persist outbound message:', err.message);
  }
}

/**
 * Unified Multi-Node Workflow Execution Engine
 */
export const workflowExecutionEngine = {
  /**
   * Main graph execution orchestrator
   *
   * @param {Object} workflow Database workflow record (nodes, edges, id, name, user_id)
   * @param {Object} context Execution context (userId, contact, conversation, message, variables, isSimulation)
   * @returns {Object} Execution results including steps, statuses, and final outbound response
   */
  executeWorkflow: async (workflow, context = {}) => {
    const workflowId = workflow?.id;
    const workflowName = workflow?.name || 'Workflow';
    const userId = workflow?.user_id || context.userId || 'usr_1';
    const isSimulation = context.isSimulation !== false;
    const channel = context.channel || 'whatsapp';

    // Tenant Security Enforcement: Tenant B cannot execute Tenant A's private workflow
    if (workflow?.user_id && context.userId && workflow.user_id !== context.userId) {
      return {
        success: false,
        status: 'failed',
        error: 'UNAUTHORIZED_TENANT: Cross-tenant workflow execution forbidden',
        executionId: `exec_unauth_${Date.now()}`,
        executionSteps: [],
      };
    }

    const nodes = Array.isArray(workflow?.nodes) ? workflow.nodes : [];
    const edges = Array.isArray(workflow?.edges) ? workflow.edges : [];

    // Normalize execution variables map
    const variables = { ...(context.variables || {}) };
    if (context.contact) {
      variables.name = variables.name || context.contact.name || '';
      variables.customer_name = variables.customer_name || context.contact.name || '';
      variables.phone_number = variables.phone_number || context.contact.phone || '';
      variables.phone = variables.phone || context.contact.phone || '';
      variables.customer_phone = variables.customer_phone || context.contact.phone || '';
      variables.email = variables.email || context.contact.email || '';
      variables.tag = variables.tag || context.contact.tag || '';
      if (context.contact.value !== undefined) {
        variables.deal_value = variables.deal_value || context.contact.value;
      }
    }
    if (context.message?.text) {
      variables.last_message = context.message.text;
      variables.trigger_input = context.message.text;
    }

    const targetPhone = context.contact?.phone || variables.customer_phone || variables.phone || null;
    const conversationId = context.conversation?.id || null;

    // Build Graph Node and Edge Lookups
    const nodeMap = new Map();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    const outgoingEdgesMap = new Map();
    edges.forEach((edge) => {
      if (!outgoingEdgesMap.has(edge.source)) {
        outgoingEdgesMap.set(edge.source, []);
      }
      outgoingEdgesMap.get(edge.source).push(edge);
    });

    // Determine Starting Node
    let currentNode = nodes.find((n) => n.id === 'trigger' || n.type === 'trigger');
    if (!currentNode && nodes.length > 0) {
      const targetIds = new Set(edges.map((e) => e.target));
      currentNode = nodes.find((n) => !targetIds.has(n.id)) || nodes[0];
    }

    const executionSteps = [];
    const visitedEdges = new Set();
    const MAX_HOPS = 25;
    let hopCount = 0;
    let hasExecutionError = false;
    let finalResponse = '';
    let lastExecutedAction = 'Executed Workflow';
    let outboundMessage = null;

    // Graph Traversal Loop
    while (currentNode && hopCount < MAX_HOPS) {
      hopCount++;
      const stepIndex = hopCount;
      const node = currentNode;
      const nodeType = node.type || 'unknown';
      const nodeLabel = node.label || node.data?.label || nodeType;

      let stepResult = {
        step: stepIndex,
        nodeId: node.id,
        type: nodeType,
        nodeType: nodeType,
        label: nodeLabel,
        status: 'completed',
        detail: '',
        nextPort: 'output',
        output: null,
      };

      try {
        // --- 1. TRIGGER NODE ---
        if (nodeType === 'trigger') {
          stepResult.detail = `Trigger activated (${node.data?.label || workflow.trigger || 'Inbound Event'})`;
          stepResult.nextPort = 'output';
        }

        // --- 2. CONDITION NODE ---
        else if (nodeType === 'condition') {
          const conditions = Array.isArray(node.data?.conditions) ? node.data.conditions : [];
          let allPassed = true;

          if (conditions.length === 0) {
            allPassed = true;
          } else {
            for (const cond of conditions) {
              const rulePassed = evaluateConditionRule(cond, variables);
              if (!rulePassed) {
                allPassed = false;
                break;
              }
            }
          }

          stepResult.passed = allPassed;
          stepResult.nextPort = allPassed ? 'true' : 'false';
          stepResult.detail = `Condition evaluated to ${allPassed ? 'TRUE' : 'FALSE'}`;
          stepResult.output = allPassed ? 'Condition Met' : 'Condition Not Met';
        }

        // --- 3. PLAIN TEXT MESSAGE NODE ---
        else if (nodeType === 'plain_message' || nodeType === 'send_message') {
          const rawText = node.data?.text || node.data?.bodyText || '';
          const interpolatedText = resolveVariables(rawText, variables);
          outboundMessage = interpolatedText;
          finalResponse = interpolatedText;
          lastExecutedAction = `Sent message: "${interpolatedText.slice(0, 40)}..."`;
          stepResult.output = interpolatedText;
          stepResult.detail = `Message formatted: "${interpolatedText.slice(0, 60)}"`;

          // Live dispatch if in production mode
          if (!isSimulation && targetPhone && targetPhone.length >= 8) {
            try {
              const sendRes = await metaWhatsAppService.sendTextMessage({
                to: targetPhone,
                text: interpolatedText,
              });
              if (sendRes?.success) {
                stepResult.detail += ` (Dispatched | WAMID: ${sendRes.wamid})`;
                await persistOutboundReply({
                  conversationId,
                  text: interpolatedText,
                  metaMessageId: sendRes.wamid,
                });
              } else {
                stepResult.status = 'send_skipped';
                stepResult.detail += ` (Dispatch skipped: ${sendRes?.error || 'Meta API offline'})`;
              }
            } catch (dispatchErr) {
              stepResult.status = 'error';
              stepResult.error = dispatchErr.message;
              stepResult.detail += ` (Dispatch error: ${dispatchErr.message})`;
            }
          }
          stepResult.nextPort = 'output';
        }

        // --- 4. MESSAGE WITH BUTTONS NODE ---
        else if (nodeType === 'message_buttons') {
          const rawText = node.data?.text || node.data?.bodyText || '';
          const interpolatedText = resolveVariables(rawText, variables);
          const buttons = Array.isArray(node.data?.buttons) ? node.data.buttons : [];
          outboundMessage = interpolatedText;
          finalResponse = interpolatedText;
          if (buttons.length > 0) {
            finalResponse += '\n\nOptions:\n' + buttons.map((b, idx) => `${idx + 1}. ${b}`).join('\n');
          }
          lastExecutedAction = `Sent message with ${buttons.length} buttons`;
          stepResult.output = { text: interpolatedText, buttons };
          stepResult.detail = `Interactive message prepared with ${buttons.length} buttons`;

          if (!isSimulation && targetPhone && targetPhone.length >= 8) {
            try {
              const sendRes = await metaWhatsAppService.sendTextMessage({
                to: targetPhone,
                text: finalResponse,
              });
              if (sendRes?.success) {
                stepResult.detail += ` (Dispatched | WAMID: ${sendRes.wamid})`;
                await persistOutboundReply({
                  conversationId,
                  text: finalResponse,
                  metaMessageId: sendRes.wamid,
                });
              }
            } catch (btnErr) {
              stepResult.detail += ` (Note: ${btnErr.message})`;
            }
          }
          stepResult.nextPort = 'output';
        }

        // --- 5. WHATSAPP TEMPLATE NODE ---
        else if (nodeType === 'template_message' || nodeType === 'wa_template') {
          const templateName = node.data?.templateName || node.data?.template?.name;
          if (!templateName) {
            stepResult.status = 'failed';
            stepResult.error = 'MISSING_TEMPLATE_NAME';
            stepResult.detail = 'Template message node is missing configured templateName';
            hasExecutionError = true;
          } else {
            stepResult.detail = `Template "${templateName}" prepared`;
            lastExecutedAction = `Dispatched template "${templateName}"`;

            if (!isSimulation && targetPhone && targetPhone.length >= 8) {
              const tmplVariables = Array.isArray(node.data?.variables)
                ? node.data.variables.map((v) => resolveVariables(String(v), variables))
                : [variables.order_number, variables.customer_name, variables.total_amount].filter(Boolean);

              try {
                const sendRes = await metaWhatsAppService.sendTemplateMessage({
                  to: targetPhone,
                  templateName,
                  language: node.data?.language || 'en_US',
                  variables: tmplVariables,
                });

                if (sendRes?.success) {
                  stepResult.detail += ` (Dispatched | WAMID: ${sendRes.wamid})`;
                } else {
                  stepResult.status = 'failed';
                  stepResult.error = 'TEMPLATE_NOT_AVAILABLE';
                  stepResult.detail += ` (Meta error: ${sendRes?.error || 'Template unapproved or unavailable'})`;
                  hasExecutionError = true;
                }
              } catch (tmplErr) {
                stepResult.status = 'failed';
                stepResult.error = 'TEMPLATE_NOT_AVAILABLE';
                stepResult.detail += ` (Error: ${tmplErr.message})`;
                hasExecutionError = true;
              }
            }
          }
          stepResult.nextPort = 'output';
        }

        // --- 6. UPDATE CRM TAG NODE ---
        else if (nodeType === 'update_tag') {
          const tagToApply = node.data?.tag || 'Updated by Workflow';
          stepResult.detail = `Apply contact tag "${tagToApply}"`;
          lastExecutedAction = `Applied tag "${tagToApply}"`;
          stepResult.output = tagToApply;

          // Real database update in contacts
          const contactId = context.contact?.id;
          const customerId = variables.customer_id;
          const phoneToMatch = targetPhone;

          try {
            if (contactId) {
              await query(
                `UPDATE contacts 
                 SET tag = $1, 
                     tags = (
                       CASE 
                         WHEN tags IS NULL THEN $2::jsonb
                         WHEN tags::jsonb @> $2::jsonb THEN tags
                         ELSE tags || $2::jsonb
                       END
                     ), 
                     updated_at = CURRENT_TIMESTAMP 
                 WHERE id = $3`,
                [tagToApply, JSON.stringify([tagToApply]), contactId]
              );
              stepResult.detail += ` (Updated contact ${contactId})`;
            } else if (customerId) {
              await query(
                `UPDATE contacts 
                 SET tag = $1, 
                     tags = (
                       CASE 
                         WHEN tags IS NULL THEN $2::jsonb
                         WHEN tags::jsonb @> $2::jsonb THEN tags
                         ELSE tags || $2::jsonb
                       END
                     ), 
                     updated_at = CURRENT_TIMESTAMP 
                 WHERE custom_attributes->>'shopify_customer_id' = $3`,
                [tagToApply, JSON.stringify([tagToApply]), String(customerId)]
              );
              stepResult.detail += ` (Updated contact for Shopify customer ${customerId})`;
            } else if (phoneToMatch) {
              const clean10 = phoneToMatch.replace(/^\+/, '').slice(-10);
              await query(
                `UPDATE contacts 
                 SET tag = $1, 
                     tags = (
                       CASE 
                         WHEN tags IS NULL THEN $2::jsonb
                         WHEN tags::jsonb @> $2::jsonb THEN tags
                         ELSE tags || $2::jsonb
                       END
                     ), 
                     updated_at = CURRENT_TIMESTAMP 
                 WHERE phone = $2 OR phone LIKE '%' || $3`,
                [tagToApply, phoneToMatch, clean10]
              );
              stepResult.detail += ` (Updated contact by phone ${phoneToMatch})`;
            }
            if (context.contact) {
              context.contact.tag = tagToApply;
            }
          } catch (tagErr) {
            stepResult.detail += ` (Tag update warning: ${tagErr.message})`;
          }
          stepResult.nextPort = 'output';
        }

        // --- 7. ASSIGN AGENT NODE ---
        else if (nodeType === 'assign_agent') {
          const agentToAssign = node.data?.agent || 'Unassigned';
          stepResult.detail = `Assign conversation to "${agentToAssign}"`;
          lastExecutedAction = `Assigned chat to "${agentToAssign}"`;
          stepResult.output = agentToAssign;

          // Real database update in conversations
          if (conversationId) {
            try {
              await query(
                `UPDATE conversations SET assignee = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
                [agentToAssign, conversationId]
              );
              stepResult.detail += ` (Conversation ${conversationId} assigned)`;
            } catch (convErr) {
              stepResult.detail += ` (Assignment note: ${convErr.message})`;
            }
          } else if (targetPhone) {
            const clean10 = targetPhone.replace(/^\+/, '').slice(-10);
            try {
              await query(
                `UPDATE conversations 
                 SET assignee = $1, updated_at = CURRENT_TIMESTAMP 
                 WHERE channel = 'whatsapp' AND (phone = $2 OR phone LIKE '%' || $3)`,
                [agentToAssign, targetPhone, clean10]
              );
              stepResult.detail += ` (Conversation for ${targetPhone} assigned)`;
            } catch (convErr) {
              stepResult.detail += ` (Assignment note: ${convErr.message})`;
            }
          }
          if (context.conversation) {
            context.conversation.assignee = agentToAssign;
          }
          stepResult.nextPort = 'output';
        }

        // --- 8. END / TERMINATION NODE ---
        else if (nodeType === 'end_workflow') {
          stepResult.detail = node.data?.message || 'Workflow completed.';
          stepResult.nextPort = null;
        }

        // --- 9. OTHER / UNSUPPORTED NODES ---
        else {
          stepResult.status = 'unsupported';
          stepResult.detail = `Unsupported node type "${nodeType}". Safely marked unsupported and bypassed.`;
          stepResult.nextPort = 'output';
        }
      } catch (nodeErr) {
        stepResult.status = 'failed';
        stepResult.error = nodeErr.message;
        stepResult.detail = `Exception: ${nodeErr.message}`;
        hasExecutionError = true;
      }

      executionSteps.push(stepResult);

      // Resolve Next Node through Outgoing Edges
      const outgoingEdges = outgoingEdgesMap.get(node.id) || [];
      let nextEdge = null;

      if (stepResult.nextPort === 'true') {
        nextEdge = outgoingEdges.find(
          (e) =>
            e.sourcePort === 'true' ||
            e.sourceHandle === 'true' ||
            e.sourcePort === 'match' ||
            (!e.sourcePort && !outgoingEdges.some((oe) => oe.sourcePort === 'false'))
        );
      } else if (stepResult.nextPort === 'false') {
        nextEdge = outgoingEdges.find(
          (e) => e.sourcePort === 'false' || e.sourceHandle === 'false' || e.sourcePort === 'else'
        );
      } else if (stepResult.nextPort && stepResult.nextPort.startsWith('btn_')) {
        nextEdge = outgoingEdges.find((e) => e.sourcePort === stepResult.nextPort) || outgoingEdges[0];
      } else if (stepResult.nextPort === 'output') {
        nextEdge = outgoingEdges.find((e) => e.sourcePort === 'output' || !e.sourcePort) || outgoingEdges[0];
      }

      // Loop Prevention Guard
      if (nextEdge) {
        const edgeSig = `${nextEdge.source}->${nextEdge.sourcePort || 'out'}->${nextEdge.target}`;
        if (visitedEdges.has(edgeSig)) {
          console.warn(`[workflowExecutionEngine] Loop detected at edge ${edgeSig}. Halting traversal safely.`);
          hasExecutionError = true;
          executionSteps.push({
            step: stepIndex + 1,
            nodeId: nextEdge.target,
            type: 'loop_guard',
            nodeType: 'loop_guard',
            label: 'Loop Prevention Guard',
            status: 'failed',
            error: 'CYCLE_DETECTED',
            detail: 'Terminated execution: circular workflow loop detected.',
          });
          break;
        }
        visitedEdges.add(edgeSig);
        currentNode = nodeMap.get(nextEdge.target) || null;
      } else {
        currentNode = null;
      }
    }

    if (hopCount >= MAX_HOPS) {
      hasExecutionError = true;
      executionSteps.push({
        step: hopCount + 1,
        nodeId: 'max_hops_guard',
        type: 'max_hops_guard',
        nodeType: 'max_hops_guard',
        label: 'Maximum Hops Guard',
        status: 'failed',
        error: 'MAX_HOPS_EXCEEDED',
        detail: `Terminated execution: exceeded safety limit of ${MAX_HOPS} node hops.`,
      });
    }

    // Monotonically increment executions counter on workflow
    try {
      await query(
        'UPDATE workflows SET executions = COALESCE(executions, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
        [workflowId]
      );
    } catch (countErr) {
      console.warn('[workflowExecutionEngine] Could not increment executions count:', countErr.message);
    }

    // Persist real execution log in automation_execution_logs
    const logId = `log_wf_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const logStatus = hasExecutionError ? 'failed' : 'completed';
    const responsePayload = {
      workflowId,
      workflowName,
      status: logStatus,
      hopCount: executionSteps.length,
      steps: executionSteps,
      outboundMessage,
      finalResponse: finalResponse || 'Workflow executed successfully.',
    };

    try {
      if (channel === 'shopify') {
        await query(
          `INSERT INTO automation_execution_logs (
             id, user_id, channel, contact_name, contact_phone, incoming_message, matched_automation_type,
             matched_automation_id, matched_automation_name, executed_action, response_payload, execution_mode, created_at
           ) VALUES ($1, $2, 'shopify', $3, $4, $5, 'workflow', $6, $7, $8, $9, 'live', CURRENT_TIMESTAMP)`,
          [
            logId,
            userId,
            context.contact?.name || variables.customer_name || 'Customer',
            targetPhone,
            context.message?.text || context.triggerEvent || `Workflow: ${workflowName}`,
            workflowId,
            workflowName,
            lastExecutedAction,
            JSON.stringify(responsePayload),
          ]
        );
      } else {
        await query(
          `INSERT INTO automation_execution_logs (
             id, user_id, channel, contact_name, contact_phone, incoming_message,
             matched_automation_type, matched_automation_id, matched_automation_name,
             executed_action, response_payload, execution_mode, created_at
           ) VALUES ($1, $2, $3, $4, $5, $6, 'workflow', $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)`,
          [
            logId,
            userId,
            channel,
            context.contact?.name || variables.customer_name || 'Customer',
            targetPhone,
            context.message?.text || context.triggerEvent || `Workflow: ${workflowName}`,
            workflowId,
            workflowName,
            lastExecutedAction,
            JSON.stringify(responsePayload),
            isSimulation ? 'simulation' : 'live',
          ]
        );
      }
    } catch (logErr) {
      console.warn('[workflowExecutionEngine] Execution log write error:', logErr.message);
    }

    const firstError = executionSteps.find((s) => s.status === 'failed' && s.error)?.error ||
      (hasExecutionError ? 'EXECUTION_FAILED' : null);

    return {
      success: !hasExecutionError,
      workflowId,
      workflowName,
      status: logStatus,
      error: firstError,
      executionId: logId,
      executionSteps,
      finalResponse: finalResponse || 'Workflow executed successfully.',
      outboundMessage,
      isSimulation,
    };
  },

  /**
   * Evaluates an incoming WhatsApp message against active tenant workflows.
   */
  evaluateInboundWhatsAppMessage: async ({ message, contact, conv, fromPhone, clean10, text, from, userId }) => {
    try {
      const messageText = typeof text === 'string' && text.trim()
        ? text.trim()
        : (
            message?.text?.body ||
            message?.interactive?.button_reply?.title ||
            message?.interactive?.button_reply?.id ||
            message?.interactive?.list_reply?.title ||
            message?.interactive?.list_reply?.id ||
            message?.button?.text ||
            message?.button?.payload ||
            message?.text ||
            ''
          );
      if (!messageText) return { handled: false, matched: false, reason: 'Empty text' };

      const tenantUserId = userId || contact?.user_id || 'usr_1';
      const normalizedMsg = messageText.toLowerCase().trim();

      // Fetch active, published workflows for this tenant
      const wfRes = await query(
        `SELECT * FROM workflows 
         WHERE (user_id = $1 OR user_id IS NULL) 
           AND status = 'active' 
           AND is_published != false`,
        [tenantUserId]
      );

      for (const wf of wfRes.rows) {
        const keywords = (
          wf.trigger_config?.keywords ||
          [wf.trigger_config?.keyword, wf.trigger]
        ).filter((k) => k && typeof k === 'string' && k.trim() && k.trim() !== '--');

        const matchType = wf.trigger_config?.match_type || 'contains';
        const match = keywords.some((k) => {
          const normK = k.toLowerCase().trim();
          if (matchType === 'exact') return normalizedMsg === normK;
          if (matchType === 'starts_with') return normalizedMsg.startsWith(normK);
          return normalizedMsg.includes(normK);
        });

        if (match) {
          console.log(`[workflowExecutionEngine] Matched Inbound WhatsApp Workflow: "${wf.name}" (${wf.id})`);
          const execRes = await workflowExecutionEngine.executeWorkflow(wf, {
            userId: tenantUserId,
            channel: 'whatsapp',
            contact: contact || { phone: fromPhone || from },
            conversation: conv,
            message: { id: message?.id, text: messageText },
            isSimulation: false,
          });

          return {
            handled: true,
            matched: true,
            workflowId: wf.id,
            result: execRes,
            executionResult: execRes,
          };
        }
      }

      return { handled: false, matched: false, reason: 'No active workflow trigger matched' };
    } catch (err) {
      console.error('[workflowExecutionEngine evaluateInboundWhatsAppMessage Error]:', err);
      return { handled: false, matched: false, error: err.message };
    }
  },
};
