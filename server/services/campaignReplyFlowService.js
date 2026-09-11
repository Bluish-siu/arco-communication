import { query } from '../config/db.js';
import { metaWhatsAppService, formatPhoneNumber } from './metaWhatsAppService.js';

/**
 * Helper to match an incoming button text/payload against a configured trigger button
 */
function matchesButton(configuredButton, incomingText, incomingId) {
  if (!configuredButton) return false;
  if (configuredButton === 'all_buttons' || configuredButton === 'any') return true;
  const cfg = String(configuredButton).trim().toLowerCase();
  const incText = String(incomingText || '').trim().toLowerCase();
  const incId = String(incomingId || '').trim().toLowerCase();
  return (cfg && incText === cfg) || (cfg && incId === cfg) || (cfg.length > 2 && incText.includes(cfg));
}

/**
 * Persists an outbound auto-reply into the ARCO Inbox (messages and conversations tables)
 */
async function persistOutboundReply({ conversationId, text, metaMessageId }) {
  if (!conversationId || !text) return;
  try {
    const newMsgId = `m_crf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
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
    console.warn('[campaignReplyFlowService] Failed to persist outbound message:', err.message);
  }
}

/**
 * Atomically reserves execution in campaign_reply_flow_logs BEFORE triggering any external Meta calls
 * or state mutations. If another concurrent request with the same inbound_meta_message_id already claimed it,
 * the ON CONFLICT clause causes RETURNING id to be empty, terminating execution immediately.
 */
async function reserveReplyFlowExecution({
  campaignId,
  recipientId,
  contactId,
  phone,
  inboundMetaMessageId,
  flowType,
  triggerMatched,
}) {
  const logId = `crf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const res = await query(
    `INSERT INTO campaign_reply_flow_logs (
       id, campaign_id, recipient_id, contact_id, phone,
       inbound_meta_message_id, flow_type, trigger_matched, action_executed,
       status, created_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'evaluating', 'processing', CURRENT_TIMESTAMP)
     ON CONFLICT (inbound_meta_message_id) DO NOTHING
     RETURNING id`,
    [
      logId,
      campaignId,
      recipientId,
      contactId,
      phone,
      inboundMetaMessageId,
      flowType,
      triggerMatched,
    ]
  );
  if (res.rows.length === 0) {
    return { reserved: false, logId: null };
  }
  return { reserved: true, logId: res.rows[0].id };
}

/**
 * Updates a previously reserved log entry with final action results, outbound message ID, and status
 */
async function finalizeReplyFlowExecution({
  logId,
  status,
  actionExecuted,
  outboundMetaMessageId,
  errorMessage,
}) {
  if (!logId) return;
  await query(
    `UPDATE campaign_reply_flow_logs
     SET status = $1,
         action_executed = COALESCE($2, action_executed),
         outbound_meta_message_id = $3,
         error_message = $4
     WHERE id = $5`,
    [
      status,
      actionExecuted || null,
      outboundMetaMessageId || null,
      errorMessage || null,
      logId,
    ]
  );
}

export const campaignReplyFlowService = {
  /**
   * Main entry point called by whatsappController when an inbound message is processed.
   * Resolves campaign attribution, matches configured reply-flow trigger, executes the action,
   * enforces idempotency via campaign_reply_flow_logs, and updates recipient/campaign metrics.
   */
  handleInboundInteraction: async ({ message, contact, conv, fromPhone, clean10 }) => {
    try {
      const messageId = message.id;
      if (!messageId) return { handled: false, reason: 'Missing inbound message ID' };

      // 1. Fast Early-Exit Idempotency Check (Sequential Duplicates)
      const existingLog = await query(
        'SELECT id, flow_type, status FROM campaign_reply_flow_logs WHERE inbound_meta_message_id = $1 LIMIT 1',
        [messageId]
      );
      if (existingLog.rows.length > 0) {
        console.log(`[campaignReplyFlowService] Inbound message ${messageId} already processed by reply flow. Skipping.`);
        return { handled: false, reason: 'Already processed (idempotent)', log: existingLog.rows[0] };
      }

      // 2. Extract Inbound User Interaction Details
      const rawContextId = message.context?.id || null;
      const buttonText = message.button?.text || message.interactive?.button_reply?.title || null;
      const buttonId = message.button?.payload || message.interactive?.button_reply?.id || null;
      const listId = message.interactive?.list_reply?.id || null;
      const listTitle = message.interactive?.list_reply?.title || null;
      const textBody = (message.text?.body || '').trim();

      // 3. Campaign Attribution Resolution
      // Primary: Match original outbound campaign recipient by Meta WAMID (Context-based)
      let matchedRecipient = null;
      let matchedCampaign = null;

      if (rawContextId) {
        const rcpRes = await query(
          `SELECT cr.*, c.post_campaign_reply_flows
           FROM campaign_recipients cr
           JOIN campaigns c ON c.id = cr.campaign_id
           WHERE cr.meta_message_id = $1
           LIMIT 1`,
          [rawContextId]
        );
        if (rcpRes.rows.length > 0) {
          matchedRecipient = rcpRes.rows[0];
          matchedCampaign = {
            id: matchedRecipient.campaign_id,
            post_campaign_reply_flows: matchedRecipient.post_campaign_reply_flows,
          };
        }
      }

      // Fallback: Match most recent sent campaign recipient for this phone number
      // Attribution Recency Boundary:
      // In WhatsApp marketing campaigns, active customer engagement peaks within 24–48 hours,
      // and ARCO's conversion attribution window is standardized at 72 hours (3 days).
      // Free-text messages sent beyond 72 hours must not be attributed to past marketing campaigns
      // to avoid unexpected automated flows, instead deferring to regular inbox/agent handling.
      // (Primary attribution with Meta WAMID context ID remains unaffected by this recency boundary).
      if (!matchedRecipient) {
        const recentRcpRes = await query(
          `SELECT cr.*, c.post_campaign_reply_flows
           FROM campaign_recipients cr
           JOIN campaigns c ON c.id = cr.campaign_id
           WHERE (cr.phone = $1 OR cr.phone = $2 OR cr.phone LIKE '%' || $3)
             AND cr.status IN ('sent', 'delivered', 'read')
             AND cr.sent_at >= CURRENT_TIMESTAMP - INTERVAL '72 hours'
           ORDER BY cr.sent_at DESC NULLS LAST
           LIMIT 1`,
          [fromPhone, fromPhone.replace(/^\+/, ''), clean10]
        );
        if (recentRcpRes.rows.length > 0) {
          matchedRecipient = recentRcpRes.rows[0];
          matchedCampaign = {
            id: matchedRecipient.campaign_id,
            post_campaign_reply_flows: matchedRecipient.post_campaign_reply_flows,
          };
        }
      }

      // If no campaign found or no reply flows configured on this campaign
      if (!matchedCampaign || !matchedCampaign.post_campaign_reply_flows) {
        return { handled: false, reason: 'No matching campaign with configured reply flows' };
      }

      const rawFlows = matchedCampaign.post_campaign_reply_flows;
      const flows = typeof rawFlows === 'string' ? JSON.parse(rawFlows) : rawFlows;
      if (!flows || Object.keys(flows).length === 0) {
        return { handled: false, reason: 'Empty reply flows configuration' };
      }

      let flowExecuted = null;

      // =======================================================================
      // FLOW 1: OPT-OUT CUSTOMER
      // =======================================================================
      if (flows.optOut && flows.optOut.enabled) {
        const f = flows.optOut;
        const incomingMatch = buttonText || textBody;
        const isOptOutButtonClick = incomingMatch && matchesButton(f.triggerButton, incomingMatch, buttonId);
        const isOptOutKeyword = textBody && ['stop', 'unsubscribe', 'optout', 'opt out'].includes(textBody.toLowerCase());

        if (isOptOutButtonClick || isOptOutKeyword) {
          console.log(`[campaignReplyFlowService] Triggering Opt-out flow for recipient ${matchedRecipient.phone}`);

          // Atomic Reservation BEFORE external Meta dispatch or contact mutation
          const reservation = await reserveReplyFlowExecution({
            campaignId: matchedCampaign.id,
            recipientId: matchedRecipient.id,
            contactId: contact?.id || null,
            phone: fromPhone,
            inboundMetaMessageId: messageId,
            flowType: 'opt_out',
            triggerMatched: buttonText || textBody,
          });

          if (!reservation.reserved) {
            console.log(`[campaignReplyFlowService] Concurrent duplicate claim for inbound message ${messageId}. Skipping.`);
            return { handled: false, reason: 'Already processed or claimed concurrently (idempotent)' };
          }

          // A. Mark contact as opted-out (whatsapp_opted = false)
          if (contact?.id) {
            await query('UPDATE contacts SET whatsapp_opted = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [contact.id]);
            contact.whatsapp_opted = false;
          }

          // B. Optional Acknowledgement Message
          let outboundWamid = null;
          let ackError = null;
          if (f.acknowledgementEnabled && f.acknowledgementText) {
            const sendRes = await metaWhatsAppService.sendTextMessage({
              to: fromPhone,
              text: f.acknowledgementText,
            });
            if (sendRes.success) {
              outboundWamid = sendRes.wamid;
              await persistOutboundReply({
                conversationId: conv?.id,
                text: f.acknowledgementText,
                metaMessageId: outboundWamid,
              });
            } else {
              ackError = sendRes.error;
            }
          }

          // C. Finalize Reserved Log
          await finalizeReplyFlowExecution({
            logId: reservation.logId,
            status: ackError ? 'partial_success' : 'success',
            actionExecuted: 'whatsapp_opted_set_false',
            outboundMetaMessageId: outboundWamid,
            errorMessage: ackError,
          });

          flowExecuted = { flowType: 'opt_out', logId: reservation.logId };
        }
      }

      // =======================================================================
      // FLOW 2: SEND YOUR PRODUCTS
      // =======================================================================
      if (!flowExecuted && flows.sendProducts && flows.sendProducts.enabled) {
        const f = flows.sendProducts;
        const incomingMatch = buttonText || textBody;
        if (incomingMatch && matchesButton(f.triggerButton, incomingMatch, buttonId)) {
          console.log(`[campaignReplyFlowService] Triggering Send Products flow for recipient ${matchedRecipient.phone}`);

          // Atomic Reservation BEFORE external Meta dispatch
          const reservation = await reserveReplyFlowExecution({
            campaignId: matchedCampaign.id,
            recipientId: matchedRecipient.id,
            contactId: contact?.id || null,
            phone: fromPhone,
            inboundMetaMessageId: messageId,
            flowType: 'send_products',
            triggerMatched: incomingMatch,
          });

          if (!reservation.reserved) {
            console.log(`[campaignReplyFlowService] Concurrent duplicate claim for inbound message ${messageId}. Skipping.`);
            return { handled: false, reason: 'Already processed or claimed concurrently (idempotent)' };
          }

          // A. Verify Catalog Connection Status
          const catalogRes = await query(
            "SELECT * FROM commerce_settings WHERE catalog_status = 'connected' LIMIT 1"
          );

          const isCatalogConnected = catalogRes.rows.length > 0;
          let outboundWamid = null;
          let catalogError = null;

          if (!isCatalogConnected) {
            catalogError = 'Commerce WhatsApp Catalog is disconnected or not configured';
            console.warn('[campaignReplyFlowService] Send Products aborted: catalog disconnected');
          } else {
            // Guard: Real active catalog products must exist before any Meta dispatch
            const productsRes = await query(
              'SELECT id, title, price, description FROM catalog_products WHERE is_active = true ORDER BY updated_at DESC LIMIT 10'
            );

            if (productsRes.rows.length === 0) {
              catalogError = 'No active products found in catalog';
              console.warn('[campaignReplyFlowService] Send Products aborted: 0 active products in catalog');
            } else {
              const bodyText = f.messageText || 'Explore our latest collections and shop directly on WhatsApp:';

              if (f.productType === 'catalog_message') {
                const sendRes = await metaWhatsAppService.sendCatalogMessage({
                  to: fromPhone,
                  bodyText,
                  footerText: f.footerText || 'Tap below to open catalog',
                });
                if (sendRes.success) {
                  outboundWamid = sendRes.wamid;
                  await persistOutboundReply({
                    conversationId: conv?.id,
                    text: bodyText,
                    metaMessageId: outboundWamid,
                  });
                } else {
                  catalogError = sendRes.error;
                }
              } else {
                const rows = productsRes.rows.map((p, idx) => ({
                  id: p.id || `prod_${idx}`,
                  title: String(p.title || `Item ${idx + 1}`).slice(0, 24),
                  description: p.price ? `₹${p.price}` : '',
                }));

                const sections = [
                  {
                    title: 'Featured Collection',
                    rows,
                  },
                ];

                const sendRes = await metaWhatsAppService.sendInteractiveListMessage({
                  to: fromPhone,
                  headerText: f.headerText || 'Product Catalog',
                  bodyText,
                  footerText: f.footerText || 'Select a product to view details',
                  buttonText: f.buttonText || 'View Products',
                  sections,
                });

                if (sendRes.success) {
                  outboundWamid = sendRes.wamid;
                  await persistOutboundReply({
                    conversationId: conv?.id,
                    text: `[Interactive List] ${bodyText}`,
                    metaMessageId: outboundWamid,
                  });
                } else {
                  catalogError = sendRes.error;
                }
              }
            }
          }

          await finalizeReplyFlowExecution({
            logId: reservation.logId,
            status: catalogError ? 'failed' : 'success',
            actionExecuted: f.productType === 'catalog_message' ? 'catalog_message' : 'product_collection_list',
            outboundMetaMessageId: outboundWamid,
            errorMessage: catalogError,
          });

          if (catalogError) {
            return { handled: false, error: catalogError };
          }

          flowExecuted = { flowType: 'send_products', logId: reservation.logId };
        }
      }

      // =======================================================================
      // FLOW 3: SEND INTERACTIVE LIST MESSAGE (Two phases: Prompt & Option Select)
      // =======================================================================
      if (!flowExecuted && flows.sendInteractiveList && flows.sendInteractiveList.enabled) {
        const f = flows.sendInteractiveList;

        // Phase A: Customer clicked campaign button or sent keyword to receive the interactive list
        const incomingMatch = buttonText || textBody;
        if (incomingMatch && matchesButton(f.triggerButton, incomingMatch, buttonId)) {
          console.log(`[campaignReplyFlowService] Triggering Interactive List prompt for recipient ${matchedRecipient.phone}`);

          // Atomic Reservation BEFORE external Meta dispatch
          const reservation = await reserveReplyFlowExecution({
            campaignId: matchedCampaign.id,
            recipientId: matchedRecipient.id,
            contactId: contact?.id || null,
            phone: fromPhone,
            inboundMetaMessageId: messageId,
            flowType: 'send_interactive_list',
            triggerMatched: incomingMatch,
          });

          if (!reservation.reserved) {
            console.log(`[campaignReplyFlowService] Concurrent duplicate claim for inbound message ${messageId}. Skipping.`);
            return { handled: false, reason: 'Already processed or claimed concurrently (idempotent)' };
          }

          const configuredOptions = Array.isArray(f.options) && f.options.length > 0
            ? f.options
            : [
                { id: 'opt_1', title: 'Customer Support', description: 'Speak with our team' },
                { id: 'opt_2', title: 'Pricing & Offers', description: 'See available discounts' },
              ];

          const rows = configuredOptions.map((opt, idx) => ({
            id: opt.id || `opt_${idx + 1}`,
            title: String(opt.title || `Option ${idx + 1}`).slice(0, 24),
            description: String(opt.description || '').slice(0, 72),
          }));

          const sections = [{ title: f.sectionTitle || 'Menu Options', rows }];
          const bodyText = f.bodyText || 'Please select an option below:';

          const sendRes = await metaWhatsAppService.sendInteractiveListMessage({
            to: fromPhone,
            headerText: f.headerText || '',
            bodyText,
            footerText: f.footerText || '',
            buttonText: f.buttonText || 'Choose Option',
            sections,
          });

          await finalizeReplyFlowExecution({
            logId: reservation.logId,
            status: sendRes.success ? 'success' : 'failed',
            actionExecuted: 'interactive_list_dispatched',
            outboundMetaMessageId: sendRes.wamid || null,
            errorMessage: sendRes.error || null,
          });

          if (sendRes.success) {
            await persistOutboundReply({
              conversationId: conv?.id,
              text: `[Interactive List] ${bodyText}`,
              metaMessageId: sendRes.wamid,
            });
          }

          flowExecuted = { flowType: 'send_interactive_list', logId: reservation.logId };
        }
        // Phase B: Customer selected an option from the list
        else if (listId || listTitle) {
          const configuredOptions = Array.isArray(f.options) ? f.options : [];
          const matchedOpt = configuredOptions.find(
            (opt) => (listId && opt.id === listId) || (listTitle && opt.title?.toLowerCase() === listTitle?.toLowerCase())
          );

          if (matchedOpt && matchedOpt.replyText) {
            console.log(`[campaignReplyFlowService] Interactive List option selected: "${matchedOpt.title}". Sending auto-reply.`);

            // Atomic Reservation BEFORE external Meta dispatch
            const reservation = await reserveReplyFlowExecution({
              campaignId: matchedCampaign.id,
              recipientId: matchedRecipient.id,
              contactId: contact?.id || null,
              phone: fromPhone,
              inboundMetaMessageId: messageId,
              flowType: 'send_interactive_list_reply',
              triggerMatched: listTitle || listId,
            });

            if (!reservation.reserved) {
              console.log(`[campaignReplyFlowService] Concurrent duplicate claim for inbound message ${messageId}. Skipping.`);
              return { handled: false, reason: 'Already processed or claimed concurrently (idempotent)' };
            }

            const sendRes = await metaWhatsAppService.sendTextMessage({
              to: fromPhone,
              text: matchedOpt.replyText,
            });

            await finalizeReplyFlowExecution({
              logId: reservation.logId,
              status: sendRes.success ? 'success' : 'failed',
              actionExecuted: 'option_custom_reply_sent',
              outboundMetaMessageId: sendRes.wamid || null,
              errorMessage: sendRes.error || null,
            });

            if (sendRes.success) {
              await persistOutboundReply({
                conversationId: conv?.id,
                text: matchedOpt.replyText,
                metaMessageId: sendRes.wamid,
              });
            }

            flowExecuted = { flowType: 'send_interactive_list_reply', logId: reservation.logId };
          }
        }
      }

      // =======================================================================
      // FLOW 4: SEND CUSTOM REPLY
      // =======================================================================
      if (!flowExecuted && flows.sendCustomReply && flows.sendCustomReply.enabled) {
        const f = flows.sendCustomReply;
        const incomingMatch = buttonText || textBody;
        if (incomingMatch && matchesButton(f.triggerButton, incomingMatch, buttonId)) {
          console.log(`[campaignReplyFlowService] Triggering Send Custom Reply flow for recipient ${matchedRecipient.phone}`);

          // Atomic Reservation BEFORE external Meta dispatch
          const reservation = await reserveReplyFlowExecution({
            campaignId: matchedCampaign.id,
            recipientId: matchedRecipient.id,
            contactId: contact?.id || null,
            phone: fromPhone,
            inboundMetaMessageId: messageId,
            flowType: 'send_custom_reply',
            triggerMatched: incomingMatch,
          });

          if (!reservation.reserved) {
            console.log(`[campaignReplyFlowService] Concurrent duplicate claim for inbound message ${messageId}. Skipping.`);
            return { handled: false, reason: 'Already processed or claimed concurrently (idempotent)' };
          }

          const replyText = f.messageText || 'Thank you for your response! A team member will assist you shortly.';
          const sendRes = await metaWhatsAppService.sendTextMessage({
            to: fromPhone,
            text: replyText,
          });

          await finalizeReplyFlowExecution({
            logId: reservation.logId,
            status: sendRes.success ? 'success' : 'failed',
            actionExecuted: 'custom_reply_sent',
            outboundMetaMessageId: sendRes.wamid || null,
            errorMessage: sendRes.error || null,
          });

          if (sendRes.success) {
            await persistOutboundReply({
              conversationId: conv?.id,
              text: replyText,
              metaMessageId: sendRes.wamid,
            });
          }

          flowExecuted = { flowType: 'send_custom_reply', logId: reservation.logId };
        }
      }

      // =======================================================================
      // FLOW 5: SEND A WORKFLOW
      // =======================================================================
      if (!flowExecuted && flows.sendWorkflow && flows.sendWorkflow.enabled) {
        const f = flows.sendWorkflow;
        const incomingMatch = buttonText || textBody;
        if (incomingMatch && matchesButton(f.triggerButton, incomingMatch, buttonId)) {
          console.log(`[campaignReplyFlowService] Triggering Send Workflow flow for recipient ${matchedRecipient.phone}`);

          // Atomic Reservation BEFORE external Meta dispatch
          const reservation = await reserveReplyFlowExecution({
            campaignId: matchedCampaign.id,
            recipientId: matchedRecipient.id,
            contactId: contact?.id || null,
            phone: fromPhone,
            inboundMetaMessageId: messageId,
            flowType: 'send_workflow',
            triggerMatched: incomingMatch,
          });

          if (!reservation.reserved) {
            console.log(`[campaignReplyFlowService] Concurrent duplicate claim for inbound message ${messageId}. Skipping.`);
            return { handled: false, reason: 'Already processed or claimed concurrently (idempotent)' };
          }

          let wfError = null;
          let outboundWamid = null;

          if (!f.workflowId) {
            wfError = 'No workflow ID configured';
          } else {
            const wfRes = await query('SELECT * FROM workflows WHERE id = $1', [f.workflowId]);
            if (wfRes.rows.length === 0) {
              wfError = `Workflow "${f.workflowId}" not found in Workflow Library`;
            } else {
              const wf = wfRes.rows[0];
              // Increment executions count on the workflow
              await query('UPDATE workflows SET executions = COALESCE(executions, 0) + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [wf.id]);

              // ARCO Workflow Architecture & Scope Note (Fix 4):
              // Workflows in ARCO are visual node graphs stored in PostgreSQL (managed via workflowController).
              // ARCO does not have an autonomous multi-node BPMN execution orchestrator in this release.
              // For this Post-Campaign Reply Flow release, the service executes the initial communication/trigger node
              // of the selected workflow for the customer via WhatsApp and increments the workflow execution counter.
              // We explicitly preserve this behavior and do not falsely imply full multi-step graph orchestration.
              const nodes = Array.isArray(wf.nodes) ? wf.nodes : [];
              const firstMsgNode = nodes.find((n) => n.data?.text || n.data?.bodyText);
              const workflowInitialMsg = firstMsgNode?.data?.text || firstMsgNode?.data?.bodyText || `Welcome to ${wf.name}`;

              const sendRes = await metaWhatsAppService.sendTextMessage({
                to: fromPhone,
                text: workflowInitialMsg,
              });

              if (sendRes.success) {
                outboundWamid = sendRes.wamid;
                await persistOutboundReply({
                  conversationId: conv?.id,
                  text: workflowInitialMsg,
                  metaMessageId: outboundWamid,
                });
              } else {
                wfError = sendRes.error;
              }
            }
          }

          await finalizeReplyFlowExecution({
            logId: reservation.logId,
            status: wfError ? 'failed' : 'success',
            actionExecuted: f.workflowId ? `workflow_${f.workflowId}` : 'none',
            outboundMetaMessageId: outboundWamid,
            errorMessage: wfError,
          });

          if (wfError) {
            return { handled: false, error: wfError };
          }

          flowExecuted = { flowType: 'send_workflow', logId: reservation.logId };
        }
      }

      // 4. Update Campaign & Recipient Metrics if a flow matched
      if (flowExecuted) {
        // Mark recipient row as replied
        await query(
          `UPDATE campaign_recipients
           SET replied_at = CURRENT_TIMESTAMP,
               status = 'replied',
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $1 AND replied_at IS NULL`,
          [matchedRecipient.id]
        );

        // Monotonically recalculate replied count for master campaign
        await query(
          `UPDATE campaigns
           SET replied = (
             SELECT COUNT(*) FROM campaign_recipients 
             WHERE campaign_id = $1 AND (status = 'replied' OR replied_at IS NOT NULL)
           ),
           updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [matchedCampaign.id]
        );

        return { handled: true, flow: flowExecuted, recipientId: matchedRecipient.id, campaignId: matchedCampaign.id };
      }

      return { handled: false, reason: 'Interaction did not match any active reply flow trigger' };
    } catch (error) {
      console.error('[campaignReplyFlowService Exception]:', error);
      return { handled: false, error: error.message };
    }
  },
};
