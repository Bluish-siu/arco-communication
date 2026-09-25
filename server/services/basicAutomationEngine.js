import { query, db } from '../config/db.js';
import { metaWhatsAppService } from './metaWhatsAppService.js';
import { parseToDate, toUtcIsoString } from '../utils/dateUtils.js';

/**
 * Normalizes day string or array for comparison.
 */
function normalizeDaysList(days) {
  if (!Array.isArray(days)) return ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  return days.map((d) => String(d).toLowerCase().trim());
}

/**
 * Evaluates whether a given reference date falls within the configured business working hours.
 * Uses native Intl.DateTimeFormat in the business timezone without hardcoding IST.
 * Supports cross-midnight schedules (e.g. 20:00 - 04:00).
 */
export function isWithinWorkingHours({ workingHoursConfig, referenceDate = new Date() }) {
  if (!workingHoursConfig || workingHoursConfig.enabled === false) {
    return {
      withinWorkingHours: true,
      isEnabled: false,
      reason: 'Working hours restriction is disabled',
      timezone: workingHoursConfig?.timezone || 'UTC',
    };
  }

  const timeZone = workingHoursConfig.timezone || 'Asia/Kolkata';
  const refDate = parseToDate(referenceDate) || new Date();

  let weekday = '';
  let hour = 0;
  let minute = 0;

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(refDate);
    for (const part of parts) {
      if (part.type === 'weekday') weekday = part.value.toLowerCase();
      if (part.type === 'hour') hour = parseInt(part.value, 10);
      if (part.type === 'minute') minute = parseInt(part.value, 10);
    }
    hour = hour % 24;
  } catch (err) {
    console.warn(`[basicAutomationEngine] Invalid timezone "${timeZone}". Falling back to UTC.`);
    return {
      withinWorkingHours: true,
      isEnabled: true,
      reason: `Invalid timezone: ${err.message}`,
      timezone: timeZone,
    };
  }

  const currentMinutes = hour * 60 + minute;
  const configuredDays = normalizeDaysList(workingHoursConfig.days);

  // Check if current day (e.g. "monday" or "mon") is among configured working days
  const isWorkingDay = configuredDays.some(
    (d) => d === weekday || d.startsWith(weekday.slice(0, 3)) || weekday.startsWith(d.slice(0, 3))
  );

  if (!isWorkingDay) {
    return {
      withinWorkingHours: false,
      isEnabled: true,
      reason: `Today (${weekday}) is not configured as a working day`,
      weekday,
      timeZone,
      currentTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    };
  }

  // Parse start and end times ("HH:mm")
  const startStr = workingHoursConfig.startTime || '09:00';
  const endStr = workingHoursConfig.endTime || '18:00';

  const [sH, sM] = startStr.split(':').map((v) => parseInt(v, 10) || 0);
  const [eH, eM] = endStr.split(':').map((v) => parseInt(v, 10) || 0);

  const startMinutes = sH * 60 + sM;
  const endMinutes = eH * 60 + eM;

  let withinHours = false;
  if (startMinutes <= endMinutes) {
    // Normal day schedule (e.g. 09:00 to 18:00)
    withinHours = currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Cross-midnight / overnight schedule (e.g. 20:00 to 04:00)
    withinHours = currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return {
    withinWorkingHours: withinHours,
    isEnabled: true,
    reason: withinHours ? 'Inside working hours' : `Outside working hours (${startStr} - ${endStr} ${timeZone})`,
    weekday,
    timeZone,
    currentTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    schedule: `${startStr} - ${endStr}`,
  };
}

/**
 * Core automation engine service
 */
export const basicAutomationEngine = {
  isWithinWorkingHours,

  /**
   * Resolves the authoritative tenant user_id from phone_number_id, waba_id, or contact.
   */
  resolveTenantUserId: async ({ phoneNumberId, wabaId, contactUserId }) => {
    if (phoneNumberId || wabaId) {
      try {
        const intRes = await query(
          `SELECT user_id FROM meta_integrations
           WHERE (phone_number_id = $1 OR waba_id = $2) AND status = 'connected'
           ORDER BY updated_at DESC LIMIT 1`,
          [phoneNumberId || null, wabaId || null]
        );
        if (intRes.rows.length > 0 && intRes.rows[0].user_id) {
          return intRes.rows[0].user_id;
        }

        // Check any integration matching phone_number_id even if status is not connected
        const anyRes = await query(
          `SELECT user_id FROM meta_integrations
           WHERE phone_number_id = $1 OR waba_id = $2
           ORDER BY updated_at DESC LIMIT 1`,
          [phoneNumberId || null, wabaId || null]
        );
        if (anyRes.rows.length > 0 && anyRes.rows[0].user_id) {
          return anyRes.rows[0].user_id;
        }
      } catch (err) {
        console.warn('[basicAutomationEngine] Error resolving tenant by phone_number_id:', err.message);
      }
    }

    if (contactUserId) {
      return contactUserId;
    }

    return 'usr_1';
  },

  /**
   * Fetches and parses automation settings for a given user.
   */
  getAutomationSettings: async (userId) => {
    try {
      const res = await query('SELECT * FROM automation_settings WHERE user_id = $1 LIMIT 1', [userId]);
      if (res.rows.length === 0) return null;
      const row = res.rows[0];
      const safeParse = (val) => {
        if (!val) return {};
        if (typeof val === 'object') return val;
        try {
          return JSON.parse(val);
        } catch {
          return {};
        }
      };
      return {
        ...row,
        working_hours: safeParse(row.working_hours),
        out_of_office: safeParse(row.out_of_office),
        welcome_message: safeParse(row.welcome_message),
        delayed_response: safeParse(row.delayed_response),
      };
    } catch (err) {
      console.warn('[basicAutomationEngine] Error fetching automation settings:', err.message);
      return null;
    }
  },

  /**
   * Checks whether an automation has already executed for this exact WAMID and automation type.
   */
  hasExecutedForWamid: async (userId, triggeringWamid, automationType) => {
    if (!triggeringWamid) return false;
    try {
      const res = await query(
        `SELECT id FROM automation_execution_logs
         WHERE user_id = $1
           AND matched_automation_type = $2
           AND (response_payload->>'triggering_wamid' = $3 OR incoming_message = $3)
         LIMIT 1`,
        [userId, automationType, triggeringWamid]
      );
      return res.rows.length > 0;
    } catch (err) {
      console.warn('[basicAutomationEngine] Idempotency lookup warning:', err.message);
      return false;
    }
  },

  /**
   * Checks whether an automation type was recently sent to the contact (cooldown check).
   */
  isCooldownActive: async (userId, contactPhone, automationType, cooldownHours = 24) => {
    if (!contactPhone) return false;
    try {
      const cleanPhone = String(contactPhone).replace(/\D/g, '');
      const clean10 = cleanPhone.slice(-10);

      const res = await query(
        `SELECT id FROM automation_execution_logs
         WHERE user_id = $1
           AND matched_automation_type = $2
           AND (contact_phone = $3 OR regexp_replace(contact_phone, '[^0-9]', '', 'g') LIKE '%' || $4)
           AND created_at >= NOW() - ($5 || ' hours')::INTERVAL
         LIMIT 1`,
        [userId, automationType, contactPhone, clean10, String(cooldownHours)]
      );
      return res.rows.length > 0;
    } catch (err) {
      console.warn('[basicAutomationEngine] Cooldown check warning:', err.message);
      return false;
    }
  },

  /**
   * Sends an automated outbound message via Meta WhatsApp Service and records to DB.
   */
  sendAndRecordAutomatedMessage: async ({
    userId,
    conversationId,
    contactId,
    contactName,
    phone,
    messageText,
    automationType,
    triggeringWamid,
    incomingMessageText,
    isSimulation = false,
  }) => {
    const cleanText = (messageText || '').trim();
    if (!cleanText) {
      return { success: false, skipped: true, reason: 'Empty response message' };
    }

    if (isSimulation) {
      return {
        success: true,
        isSimulation: true,
        messageText: cleanText,
        action: `[Simulation] Would send ${automationType} message to ${phone}`,
      };
    }

    // 1. Dispatch through authoritative Meta WhatsApp Service using tenant credentials
    let sendResult = { success: false, error: 'Not sent' };
    try {
      sendResult = await metaWhatsAppService.sendTextMessage({
        to: phone,
        text: cleanText,
        previewUrl: false,
        userId,
      });
    } catch (err) {
      sendResult = { success: false, error: err.message };
    }

    const now = new Date();
    const isoNow = now.toISOString();
    const metaMessageId = sendResult?.messageId || null;
    const msgStatus = sendResult?.success ? 'delivered' : 'failed';
    const errorMsg = sendResult?.success ? null : (sendResult?.error || 'Send failed');

    // 2. Insert into messages table so Inbox timeline reflects outbound automation
    if (conversationId) {
      try {
        const msgId = `m_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await query(
          `INSERT INTO messages (
             id, conversation_id, sender, text, time, timestamp, meta_message_id,
             status, error_message, message_type, created_at
           ) VALUES ($1, $2, 'agent', $3, $4, $5, $6, $7, $8, 'text', CURRENT_TIMESTAMP)`,
          [
            msgId,
            conversationId,
            cleanText,
            isoNow,
            now,
            metaMessageId,
            msgStatus,
            errorMsg,
          ]
        );

        // Update conversation summary
        await query(
          `UPDATE conversations SET
             last_message_time = 'Just now',
             updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [conversationId]
        );
      } catch (dbErr) {
        console.warn('[basicAutomationEngine] Error inserting outbound message to DB:', dbErr.message);
      }
    }

    // 3. Log to automation_execution_logs
    try {
      const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      await query(
        `INSERT INTO automation_execution_logs (
           id, user_id, channel, contact_name, contact_phone, incoming_message,
           matched_automation_type, matched_automation_id, matched_automation_name,
           executed_action, response_payload, execution_mode, created_at
         ) VALUES ($1, $2, 'whatsapp', $3, $4, $5, $6, $7, $8, $9, $10, 'live', CURRENT_TIMESTAMP)`,
        [
          logId,
          userId,
          contactName || 'WhatsApp Customer',
          phone,
          incomingMessageText || triggeringWamid || 'Inbound WhatsApp message',
          automationType,
          `aset_${userId}`,
          automationType === 'ooo' ? 'Out of Office' : automationType === 'welcome' ? 'Welcome Message' : 'Delayed Response',
          sendResult.success ? `Sent ${automationType} WhatsApp response` : `Failed to send ${automationType}: ${errorMsg}`,
          JSON.stringify({
            text: cleanText,
            meta_message_id: metaMessageId,
            triggering_wamid: triggeringWamid,
            success: sendResult.success,
            error: errorMsg,
          }),
        ]
      );
    } catch (logErr) {
      console.warn('[basicAutomationEngine] Error recording execution log:', logErr.message);
    }

    return {
      success: sendResult.success,
      metaMessageId,
      error: errorMsg,
    };
  },

  /**
   * Evaluates all Basic Automations conditions without side effects (used by both Live and Simulation).
   */
  evaluateBasicAutomations: async ({
    userId,
    phone,
    contact = null,
    conv = null,
    isNewConversation = false,
    previousLastInbound = null,
    messageText = '',
    triggeringWamid = null,
    referenceDate = new Date(),
  }) => {
    // 1. Fetch user automation settings
    let settings = null;
    try {
      const res = await query('SELECT * FROM automation_settings WHERE user_id = $1 LIMIT 1', [userId]);
      if (res.rows.length > 0) {
        settings = res.rows[0];
      }
    } catch (err) {
      console.warn('[basicAutomationEngine] Error fetching settings:', err.message);
    }

    if (!settings) {
      return {
        hasSettings: false,
        evaluatedAt: referenceDate.toISOString(),
        workingHours: { withinWorkingHours: true, isEnabled: false },
        outOfOffice: { triggered: false, reason: 'No automation settings found' },
        welcome: { triggered: false, reason: 'No automation settings found' },
        delayedResponse: { triggered: false, reason: 'No automation settings found' },
      };
    }

    const workingHoursConfig = settings.working_hours || {};
    const oooConfig = settings.out_of_office || {};
    const welcomeConfig = settings.welcome_message || {};
    const delayedConfig = settings.delayed_response || {};

    // 2. Evaluate Working Hours
    const whResult = isWithinWorkingHours({
      workingHoursConfig,
      referenceDate,
    });

    // 3. Evaluate Out of Office (OOO)
    let oooTriggered = false;
    let oooReason = '';
    let oooMessage = oooConfig.message || '';

    if (!oooConfig || oooConfig.enabled !== true) {
      oooReason = 'Out of Office is disabled in settings';
    } else if (whResult.withinWorkingHours) {
      oooReason = 'Inside working hours';
    } else {
      oooTriggered = true;
      oooReason = 'Inbound message arrived outside working hours';
    }

    // 4. Evaluate Welcome Message
    let welcomeTriggered = false;
    let welcomeReason = '';
    let welcomeMessage = welcomeConfig.message || '';

    if (!welcomeConfig || welcomeConfig.enabled !== true) {
      welcomeReason = 'Welcome message is disabled in settings';
    } else {
      // Determine if customer qualifies:
      // a) Brand new contact / conversation
      // b) Re-engagement after > 24 hours of inactivity
      let qualifiesForWelcome = false;
      if (isNewConversation) {
        qualifiesForWelcome = true;
        welcomeReason = 'New customer reaching out for the first time';
      } else if (previousLastInbound) {
        const lastInboundTime = new Date(previousLastInbound).getTime();
        const refTime = referenceDate.getTime();
        const diffHours = (refTime - lastInboundTime) / (1000 * 60 * 60);
        if (diffHours >= 24) {
          qualifiesForWelcome = true;
          welcomeReason = `Existing customer re-engaging after ${diffHours.toFixed(1)} hours of inactivity (>24h)`;
        } else {
          welcomeReason = `Ongoing conversation (last active ${diffHours.toFixed(1)}h ago; < 24h)`;
        }
      } else {
        qualifiesForWelcome = true;
        welcomeReason = 'Conversation without previous inbound history';
      }

      if (qualifiesForWelcome) {
        // Check sendWithOoo interaction
        if (oooTriggered && welcomeConfig.sendWithOoo === false) {
          welcomeReason = 'Suppressed because Out of Office triggered and sendWithOoo is disabled';
        } else {
          welcomeTriggered = true;
        }
      }
    }

    // 5. Evaluate Delayed Response
    let delayedTriggered = false;
    let delayedReason = '';
    let delayHours = Number(delayedConfig.delayHours || 0);
    let delayMinutes = Number(delayedConfig.delayMinutes !== undefined ? delayedConfig.delayMinutes : 10);
    let delayTotalMinutes = delayHours * 60 + delayMinutes;
    if (delayTotalMinutes <= 0) delayTotalMinutes = 10;

    let delayedScheduledAt = new Date(referenceDate.getTime() + delayTotalMinutes * 60 * 1000);

    if (!delayedConfig || delayedConfig.enabled !== true) {
      delayedReason = 'Delayed response is disabled in settings';
    } else {
      delayedTriggered = true;
      delayedReason = `Will execute after ${delayTotalMinutes} minutes if conversation remains unreplied by agent`;
    }

    return {
      hasSettings: true,
      evaluatedAt: referenceDate.toISOString(),
      workingHours: whResult,
      outOfOffice: {
        enabled: Boolean(oooConfig.enabled),
        triggered: oooTriggered,
        reason: oooReason,
        message: oooMessage,
      },
      welcome: {
        enabled: Boolean(welcomeConfig.enabled),
        triggered: welcomeTriggered,
        reason: welcomeReason,
        message: welcomeMessage,
      },
      delayedResponse: {
        enabled: Boolean(delayedConfig.enabled),
        triggered: delayedTriggered,
        reason: delayedReason,
        delayTotalMinutes,
        scheduledAt: delayedScheduledAt.toISOString(),
        message: delayedConfig.message || '',
      },
    };
  },

  /**
   * Main entry point called by whatsappController when an inbound customer message arrives.
   * Safe and non-blocking: errors are caught and logged so webhook never fails.
   */
  handleInboundMessage: async ({
    phoneNumberId,
    wabaId,
    contact,
    conv,
    isNewConversation = false,
    previousLastInbound = null,
    messageText = '',
    triggeringWamid = null,
    fromPhone = '',
    clean10 = '',
    referenceDate = new Date(),
    postCampaignHandled = false,
    workflowHandled = false,
  }) => {
    try {
      // Resolve tenant user_id
      const userId = await basicAutomationEngine.resolveTenantUserId({
        phoneNumberId,
        wabaId,
        contactUserId: contact?.user_id,
      });

      const effectivePhone = fromPhone || contact?.phone || conv?.phone || '';

      // Evaluate conditions
      const evaluation = await basicAutomationEngine.evaluateBasicAutomations({
        userId,
        phone: effectivePhone,
        contact,
        conv,
        isNewConversation,
        previousLastInbound,
        messageText,
        triggeringWamid,
        referenceDate,
      });

      console.log(`[basicAutomationEngine] Evaluation for user ${userId}, contact ${effectivePhone}:`, {
        withinWorkingHours: evaluation.workingHours.withinWorkingHours,
        oooTriggered: evaluation.outOfOffice.triggered,
        welcomeTriggered: evaluation.welcome.triggered,
        delayedTriggered: evaluation.delayedResponse.triggered,
      });

      // 1. Process Out of Office (OOO)
      if (evaluation.outOfOffice.triggered) {
        // Idempotency check: has this WAMID already triggered OOO?
        const alreadyWamid = await basicAutomationEngine.hasExecutedForWamid(userId, triggeringWamid, 'ooo');
        // Cooldown check: has this contact received an OOO in the last 24 hours?
        const cooldownActive = await basicAutomationEngine.isCooldownActive(userId, effectivePhone, 'ooo', 24);

        if (alreadyWamid) {
          console.log(`[basicAutomationEngine] Skipping OOO for WAMID ${triggeringWamid} (already executed)`);
        } else if (cooldownActive) {
          console.log(`[basicAutomationEngine] Skipping OOO for ${effectivePhone} (24-hour cooldown active)`);
        } else {
          await basicAutomationEngine.sendAndRecordAutomatedMessage({
            userId,
            conversationId: conv?.id,
            contactId: contact?.id,
            contactName: contact?.name,
            phone: effectivePhone,
            messageText: evaluation.outOfOffice.message,
            automationType: 'ooo',
            triggeringWamid,
            incomingMessageText: messageText,
            isSimulation: false,
          });
        }
      }

      // 2. Process Welcome Message
      if (evaluation.welcome.triggered) {
        // Idempotency check: has this WAMID already triggered Welcome?
        const alreadyWamid = await basicAutomationEngine.hasExecutedForWamid(userId, triggeringWamid, 'welcome');
        // Cooldown check: has this contact received Welcome in the last 24 hours?
        const cooldownActive = await basicAutomationEngine.isCooldownActive(userId, effectivePhone, 'welcome', 24);

        if (alreadyWamid) {
          console.log(`[basicAutomationEngine] Skipping Welcome for WAMID ${triggeringWamid} (already executed)`);
        } else if (cooldownActive) {
          console.log(`[basicAutomationEngine] Skipping Welcome for ${effectivePhone} (24-hour cooldown active)`);
        } else {
          await basicAutomationEngine.sendAndRecordAutomatedMessage({
            userId,
            conversationId: conv?.id,
            contactId: contact?.id,
            contactName: contact?.name,
            phone: effectivePhone,
            messageText: evaluation.welcome.message,
            automationType: 'welcome',
            triggeringWamid,
            incomingMessageText: messageText,
            isSimulation: false,
          });
        }
      }

      // 3. Process Delayed Response Scheduling
      // Only schedule if delayed response is enabled and conversation is active
      if (evaluation.delayedResponse.triggered && conv?.id && effectivePhone) {
        // Cancel any existing pending delayed job for this conversation (superseded by new inbound message)
        await basicAutomationEngine.cancelPendingDelayedJobs(conv.id, 'Superseded by newer inbound message');

        // Schedule new persistent job in PostgreSQL
        const jobId = `job_del_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await query(
          `INSERT INTO delayed_automation_jobs (
             id, user_id, conversation_id, contact_id, contact_phone, triggering_wamid,
             automation_type, message_text, scheduled_at, status, created_at, updated_at
           ) VALUES ($1, $2, $3, $4, $5, $6, 'delayed_response', $7, $8, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [
            jobId,
            userId,
            conv.id,
            contact?.id || null,
            effectivePhone,
            triggeringWamid || jobId,
            evaluation.delayedResponse.message,
            evaluation.delayedResponse.scheduledAt,
          ]
        );
        console.log(`[basicAutomationEngine] Scheduled delayed response job ${jobId} for ${evaluation.delayedResponse.scheduledAt}`);
      }

      return {
        success: true,
        evaluation,
      };
    } catch (err) {
      console.error('[basicAutomationEngine] Unhandled error in handleInboundMessage:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Cancels pending delayed jobs for a conversation (e.g. when an agent replies via Inbox).
   */
  cancelPendingDelayedJobs: async (conversationId, reason = 'Agent replied manually via Inbox') => {
    if (!conversationId) return 0;
    try {
      const res = await query(
        `UPDATE delayed_automation_jobs
         SET status = 'cancelled',
             cancellation_reason = $1,
             cancelled_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE conversation_id = $2 AND status = 'pending'
         RETURNING id`,
        [reason, conversationId]
      );
      if (res.rows.length > 0) {
        console.log(`[basicAutomationEngine] Cancelled ${res.rows.length} pending delayed job(s) for conv ${conversationId} (${reason})`);
      }
      return res.rows.length;
    } catch (err) {
      console.warn('[basicAutomationEngine] Error cancelling pending delayed jobs:', err.message);
      return 0;
    }
  },

  /**
   * Background dispatcher tick: fetches due delayed jobs and processes them with transactional locking.
   * Concurrency-safe: uses FOR UPDATE SKIP LOCKED.
   */
  processDueDelayedJobs: async () => {
    try {
      // 1. Transactionally lock due pending jobs
      const dueRes = await query(`
        SELECT * FROM delayed_automation_jobs
        WHERE status = 'pending' AND scheduled_at <= CURRENT_TIMESTAMP
        ORDER BY scheduled_at ASC
        LIMIT 10
        FOR UPDATE SKIP LOCKED
      `);

      if (dueRes.rows.length === 0) return 0;

      for (const job of dueRes.rows) {
        try {
          // 0. Verify delayed_response is still enabled in user's automation_settings
          const settings = await basicAutomationEngine.getAutomationSettings(job.user_id);
          if (!settings || !settings.delayed_response?.enabled) {
            await query(
              `UPDATE delayed_automation_jobs
               SET status = 'cancelled',
                   cancellation_reason = 'Delayed response is disabled in automation settings',
                   cancelled_at = CURRENT_TIMESTAMP,
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = $1`,
              [job.id]
            );
            console.log(`[basicAutomationEngine] Cancelled delayed job ${job.id}: delayed response is disabled in settings.`);
            continue;
          }

          // Check if conversation has received an agent reply since job was scheduled
          const replyCheck = await query(
            `SELECT id, created_at, sender FROM messages
             WHERE conversation_id = $1
               AND sender IN ('agent', 'me')
               AND created_at >= $2
             LIMIT 1`,
            [job.conversation_id, job.created_at]
          );

          if (replyCheck.rows.length > 0) {
            // Agent responded! Cancel job
            await query(
              `UPDATE delayed_automation_jobs
               SET status = 'cancelled',
                   cancellation_reason = 'Agent replied before delay elapsed',
                   cancelled_at = CURRENT_TIMESTAMP,
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = $1`,
              [job.id]
            );

            // Log cancellation
            await query(
              `INSERT INTO automation_execution_logs (
                 id, user_id, channel, contact_name, contact_phone, incoming_message,
                 matched_automation_type, matched_automation_id, matched_automation_name,
                 executed_action, response_payload, execution_mode, created_at
               ) VALUES ($1, $2, 'whatsapp', 'Customer', $3, $4, 'delayed_response', $5,
                 'Delayed Response Message', 'Skipped: Agent replied before delay elapsed', $6, 'live', CURRENT_TIMESTAMP)`,
              [
                `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                job.user_id,
                job.contact_phone,
                job.triggering_wamid || 'Delayed response trigger',
                job.id,
                JSON.stringify({ status: 'cancelled', reason: 'Agent replied before delay elapsed' }),
              ]
            );

            console.log(`[basicAutomationEngine] Delayed job ${job.id} cancelled: agent already replied.`);
            continue;
          }

          // Unreplied: Dispatch delayed message via Meta WhatsApp Service
          const sendResult = await basicAutomationEngine.sendAndRecordAutomatedMessage({
            userId: job.user_id,
            conversationId: job.conversation_id,
            contactId: job.contact_id,
            contactName: 'Customer',
            phone: job.contact_phone,
            messageText: job.message_text,
            automationType: 'delayed_response',
            triggeringWamid: job.triggering_wamid,
            incomingMessageText: 'Delayed Response Follow-up',
            isSimulation: false,
          });

          if (sendResult.success) {
            await query(
              `UPDATE delayed_automation_jobs
               SET status = 'completed',
                   meta_message_id = $1,
                   executed_at = CURRENT_TIMESTAMP,
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = $2`,
              [sendResult.metaMessageId || null, job.id]
            );
            console.log(`[basicAutomationEngine] Delayed response job ${job.id} dispatched successfully to ${job.contact_phone}.`);
          } else {
            await query(
              `UPDATE delayed_automation_jobs
               SET status = 'failed',
                   error_message = $1,
                   updated_at = CURRENT_TIMESTAMP
               WHERE id = $2`,
              [sendResult.error || 'Dispatch error', job.id]
            );
            console.warn(`[basicAutomationEngine] Delayed response job ${job.id} failed to dispatch: ${sendResult.error}`);
          }
        } catch (jobErr) {
          console.error(`[basicAutomationEngine] Error processing job ${job.id}:`, jobErr.message);
          await query(
            `UPDATE delayed_automation_jobs
             SET status = 'failed',
                 error_message = $1,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [jobErr.message, job.id]
          );
        }
      }

      return dueRes.rows.length;
    } catch (err) {
      console.warn('[basicAutomationEngine] Error during processDueDelayedJobs tick:', err.message);
      return 0;
    }
  },
};

let schedulerInterval = null;

/**
 * Starts the lightweight background poller for delayed jobs.
 */
export function startBasicAutomationScheduler(intervalMs = 20000) {
  if (schedulerInterval) return schedulerInterval;

  // Run initial poll shortly after boot
  setTimeout(() => {
    basicAutomationEngine.processDueDelayedJobs().catch((err) =>
      console.warn('[Delayed Job Scheduler] Initial poll warning:', err.message)
    );
  }, 3000);

  schedulerInterval = setInterval(() => {
    basicAutomationEngine.processDueDelayedJobs().catch((err) =>
      console.warn('[Delayed Job Scheduler] Interval poll warning:', err.message)
    );
  }, intervalMs);

  if (schedulerInterval.unref) {
    schedulerInterval.unref();
  }

  console.log(`[Delayed Job Scheduler] Background poller started (interval: ${intervalMs}ms).`);
  return schedulerInterval;
}

/**
 * Stops the periodic poller.
 */
export function stopBasicAutomationScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    console.log('[Delayed Job Scheduler] Background poller stopped.');
  }
}
