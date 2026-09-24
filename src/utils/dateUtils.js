/**
 * ARCO Communication - Centralized Date & Timezone Utility
 * 
 * Provides consistent, timezone-aware parsing and formatting across ARCO.
 * - Stored & API timestamps: UTC ISO-8601 (e.g. "2026-09-24T05:07:51.822Z")
 * - Meta WhatsApp Webhook timestamps: Unix epoch in seconds (e.g. 1790226471)
 * - Display: Browser's local timezone (via Intl.DateTimeFormat) or specified timezone
 * 
 * No hardcoded timezone offsets (+5:30 or others).
 */

/**
 * Get the current user's local timezone identifier.
 * e.g. "Asia/Kolkata", "America/New_York", "Europe/London"
 */
export function getUserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Robustly parses various timestamp formats into a valid JavaScript Date object.
 * Handles:
 * - Date objects
 * - Unix epoch in seconds (Meta WhatsApp Webhook: 10 digits e.g. 1790226471)
 * - Unix epoch in milliseconds (13 digits e.g. 1790226471822)
 * - ISO-8601 strings with Z or offsets ("2026-09-24T05:07:51.822Z", "2026-09-24T10:37:51+05:30")
 * - Naive ISO strings without timezone (treats as UTC)
 * - Stringified numbers ("1790226471")
 * 
 * Returns null for invalid or nullish inputs.
 */
export function parseToDate(input) {
  if (input === null || input === undefined || input === '') {
    return null;
  }

  // Already a Date object
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  // Numeric epoch timestamp
  if (typeof input === 'number') {
    if (isNaN(input) || !isFinite(input)) return null;
    // Values less than 1e11 are Unix epoch seconds (Meta webhooks), > 1e11 are milliseconds
    const ms = input < 1e11 ? input * 1000 : input;
    const date = new Date(ms);
    return isNaN(date.getTime()) ? null : date;
  }

  // String timestamp
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Check if numeric string
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      const num = Number(trimmed);
      if (isNaN(num)) return null;
      const ms = num < 1e11 ? num * 1000 : num;
      const date = new Date(ms);
      return isNaN(date.getTime()) ? null : date;
    }

    // Check if ISO string without timezone indicator (e.g. "2026-09-24T05:07:51" or "2026-09-24 05:07:51")
    // Database naive strings are stored in UTC; parse them as UTC to prevent local interpretation
    let normalized = trimmed;
    if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(normalized)) {
      normalized = normalized.replace(' ', 'T') + 'Z';
    }

    const date = new Date(normalized);
    if (!isNaN(date.getTime())) {
      return date;
    }

    // Legacy relative string or time string (e.g. "10:40 AM", "Yesterday")
    return null;
  }

  return null;
}

/**
 * Format timestamp as a localized time string (e.g. "10:37 AM").
 * Converts from UTC to user's local timezone.
 * 
 * @param {string|number|Date} input - Timestamp to format
 * @param {object} [options] - Formatting options
 * @param {string} [options.timeZone] - Explicit timezone override (default: user's local timezone)
 * @param {string} [options.fallback] - Fallback string if invalid
 * @returns {string} Formatted time string
 */
export function formatTime(input, options = {}) {
  const date = parseToDate(input);
  if (!date) {
    // If input is already a string like "10:37 AM" or "Just now", return it as fallback
    if (typeof input === 'string' && input.trim()) {
      return input.trim();
    }
    return options.fallback !== undefined ? options.fallback : '—';
  }

  const timeZone = options.timeZone || getUserTimeZone();
  const locale = options.locale || 'en-US';
  try {
    const formatted = new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone,
      ...options,
    }).format(date);
    // Normalize narrow non-breaking space (U+202F) or non-breaking space (U+00A0) to standard space
    return formatted.replace(/[\u202f\u00a0]/g, ' ').replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());
  } catch (err) {
    console.warn('[dateUtils.formatTime] Intl formatting error:', err);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }
}

/**
 * Format timestamp as a localized date string (e.g. "24 Sep 2026").
 * 
 * @param {string|number|Date} input - Timestamp to format
 * @param {object} [options] - Formatting options
 * @returns {string} Formatted date string
 */
export function formatDate(input, options = {}) {
  const date = parseToDate(input);
  if (!date) {
    if (typeof input === 'string' && input.trim()) {
      return input.trim();
    }
    return options.fallback !== undefined ? options.fallback : '—';
  }

  const timeZone = options.timeZone || getUserTimeZone();
  const locale = options.locale || 'en-US';
  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone,
      ...options,
    }).format(date);
  } catch (err) {
    console.warn('[dateUtils.formatDate] Intl formatting error:', err);
    return date.toLocaleDateString();
  }
}

/**
 * Format timestamp as localized date and time (e.g. "Sep 24, 2026, 10:37 AM").
 * 
 * @param {string|number|Date} input - Timestamp to format
 * @param {object} [options] - Formatting options
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(input, options = {}) {
  const date = parseToDate(input);
  if (!date) {
    if (typeof input === 'string' && input.trim()) {
      return input.trim();
    }
    return options.fallback !== undefined ? options.fallback : '—';
  }

  const timeZone = options.timeZone || getUserTimeZone();
  const locale = options.locale || 'en-US';
  try {
    const formatted = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone,
      ...options,
    }).format(date);
    return formatted.replace(/[\u202f\u00a0]/g, ' ').replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());
  } catch (err) {
    console.warn('[dateUtils.formatDateTime] Intl formatting error:', err);
    return date.toLocaleString();
  }
}

/**
 * Format timestamp as a smart relative time string for chat list / inbox.
 * - Today: "10:37 AM"
 * - Yesterday: "Yesterday"
 * - Within last 6 days: Day name, e.g. "Monday"
 * - Older: "24 Sep" (or "24 Sep 2025" if different year)
 * 
 * @param {string|number|Date} input - Timestamp to format
 * @param {object} [options] - Formatting options
 * @returns {string} Human-readable relative time string
 */
export function formatRelativeTime(input, options = {}) {
  const date = parseToDate(input);
  if (!date) {
    if (typeof input === 'string' && input.trim()) {
      return input.trim();
    }
    return options.fallback !== undefined ? options.fallback : 'Just now';
  }

  const timeZone = options.timeZone || getUserTimeZone();

  try {
    // Get calendar dates in target timezone for accurate day comparison
    const targetFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const nowParts = targetFormatter.format(new Date()).split('-');
    const dateParts = targetFormatter.format(date).split('-');

    const nowDate = new Date(Number(nowParts[0]), Number(nowParts[1]) - 1, Number(nowParts[2]));
    const targetDate = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]));

    const diffDays = Math.round((nowDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

    // Today -> format time (e.g. "10:37 AM")
    if (diffDays === 0) {
      return formatTime(date, { timeZone, ...options });
    }

    // Yesterday -> "Yesterday"
    if (diffDays === 1) {
      return 'Yesterday';
    }

    // Within last 6 days -> Weekday name (e.g. "Wednesday")
    if (diffDays > 1 && diffDays < 7) {
      return new Intl.DateTimeFormat(options.locale || undefined, {
        weekday: 'short',
        timeZone,
      }).format(date);
    }

    // Same year -> "24 Sep"
    if (nowParts[0] === dateParts[0]) {
      return new Intl.DateTimeFormat(options.locale || undefined, {
        day: 'numeric',
        month: 'short',
        timeZone,
      }).format(date);
    }

    // Different year -> "24 Sep 2025"
    return new Intl.DateTimeFormat(options.locale || undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone,
    }).format(date);
  } catch (err) {
    console.warn('[dateUtils.formatRelativeTime] Error:', err);
    return formatTime(date, options);
  }
}

/**
 * Format a message object's timestamp for inbox message bubbles.
 * Prioritizes UTC timestamp / createdAt over legacy pre-rendered time string.
 * 
 * @param {object} msg - Message object with { timestamp, created_at, createdAt, time }
 * @param {object} [options] - Options
 * @returns {string} Localized time string (e.g. "10:37 AM")
 */
export function formatMessageTime(msg, options = {}) {
  if (!msg) return '—';

  // 1. Prioritize real UTC timestamps
  const rawTs = msg.timestamp || msg.created_at || msg.createdAt;
  if (rawTs) {
    const parsed = parseToDate(rawTs);
    if (parsed) {
      return formatTime(parsed, options);
    }
  }

  // 2. If legacy msg.time is present and non-empty, return it
  if (typeof msg.time === 'string' && msg.time.trim()) {
    // If msg.time happens to be an ISO timestamp, parse it
    const parsedTime = parseToDate(msg.time);
    if (parsedTime) {
      return formatTime(parsedTime, options);
    }
    return msg.time.trim();
  }

  return 'Just now';
}

/**
 * Format a conversation object's last message time for sidebar list.
 * 
 * @param {object} chat - Conversation object
 * @param {object} [options] - Options
 * @returns {string} Formatted relative time string
 */
export function formatConversationTime(chat, options = {}) {
  if (!chat) return 'Just now';

  // 1. Check last message's timestamp
  if (Array.isArray(chat.messages) && chat.messages.length > 0) {
    const lastMsg = chat.messages[chat.messages.length - 1];
    const rawTs = lastMsg?.timestamp || lastMsg?.created_at || lastMsg?.createdAt;
    if (rawTs) {
      const parsed = parseToDate(rawTs);
      if (parsed) {
        return formatRelativeTime(parsed, options);
      }
    }
  }

  // 2. Check conversation updatedAt or lastInboundAt
  const convTs = chat.updatedAt || chat.updated_at || chat.lastInboundAt || chat.last_inbound_at;
  if (convTs) {
    const parsed = parseToDate(convTs);
    if (parsed) {
      return formatRelativeTime(parsed, options);
    }
  }

  // 3. Fallback to chat.lastMessageTime if string
  if (typeof chat.lastMessageTime === 'string' && chat.lastMessageTime.trim()) {
    const parsed = parseToDate(chat.lastMessageTime);
    if (parsed) {
      return formatRelativeTime(parsed, options);
    }
    return chat.lastMessageTime.trim();
  }

  return 'Just now';
}
