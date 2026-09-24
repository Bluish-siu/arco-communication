/**
 * ARCO Communication - Server-side Date & Timezone Utility
 * 
 * Standardizes timestamp conversion and serialization on the backend.
 * Guarantees that timestamps sent to PostgreSQL and API responses are valid ISO-8601 UTC strings.
 */

/**
 * Robustly parses various timestamp formats into a valid JavaScript Date object.
 * Handles:
 * - Date objects
 * - Unix epoch in seconds (Meta WhatsApp Webhook: 10 digits e.g. 1790226471)
 * - Unix epoch in milliseconds (13 digits e.g. 1790226471822)
 * - ISO-8601 strings with Z or offsets ("2026-09-24T05:07:51.822Z", "2026-09-24T10:37:51+05:30")
 * - Naive ISO strings without timezone (treats as UTC)
 * - Stringified numbers ("1790226471")
 */
export function parseToDate(input) {
  if (input === null || input === undefined || input === '') {
    return null;
  }

  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  if (typeof input === 'number') {
    if (isNaN(input) || !isFinite(input)) return null;
    const ms = input < 1e11 ? input * 1000 : input;
    const date = new Date(ms);
    return isNaN(date.getTime()) ? null : date;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;

    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      const num = Number(trimmed);
      if (isNaN(num)) return null;
      const ms = num < 1e11 ? num * 1000 : num;
      const date = new Date(ms);
      return isNaN(date.getTime()) ? null : date;
    }

    let normalized = trimmed;
    if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(normalized)) {
      normalized = normalized.replace(' ', 'T') + 'Z';
    }

    const date = new Date(normalized);
    if (!isNaN(date.getTime())) {
      return date;
    }

    return null;
  }

  return null;
}

/**
 * Convert any timestamp input to an unambiguous UTC ISO-8601 string.
 * Example: "2026-09-24T05:07:51.822Z"
 * 
 * @param {string|number|Date} input
 * @param {Date} [fallbackDate]
 * @returns {string} ISO-8601 UTC string
 */
export function toUtcIsoString(input, fallbackDate = new Date()) {
  const date = parseToDate(input);
  if (date) {
    return date.toISOString();
  }
  return (fallbackDate instanceof Date && !isNaN(fallbackDate.getTime()) ? fallbackDate : new Date()).toISOString();
}

/**
 * Parse Meta WhatsApp webhook timestamp.
 * Meta provides timestamps as Unix epoch in seconds (string or number).
 * 
 * @param {string|number} rawTimestamp
 * @returns {Date}
 */
export function parseMetaWebhookTimestamp(rawTimestamp) {
  if (!rawTimestamp) return new Date();
  const parsed = parseToDate(rawTimestamp);
  return parsed || new Date();
}

/**
 * Format timestamp in a specific timezone using Intl.DateTimeFormat (useful for server-side reports or tests).
 * 
 * @param {string|number|Date} input
 * @param {string} timeZone - e.g. "Asia/Kolkata", "America/New_York"
 * @param {object} [options]
 * @returns {string}
 */
export function formatInTimeZone(input, timeZone = 'UTC', options = {}) {
  const date = parseToDate(input);
  if (!date) return '—';

  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone,
    ...options,
  }).format(date);
}
