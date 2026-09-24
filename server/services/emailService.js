import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { config } from '../config/index.js';

let customTransporter = null;
let customResendClient = null;

export const emailService = {
  /**
   * Check if email service is configured (Resend API key or SMTP)
   * @returns {boolean}
   */
  isConfigured: () => {
    return Boolean(
      config.resend?.apiKey ||
      (config.smtp?.host && (config.smtp?.user || config.smtp?.port))
    );
  },

  /**
   * Determine active email provider
   * @returns {'resend'|'smtp'|'custom'|'none'}
   */
  getActiveProvider: () => {
    if (customTransporter || customResendClient) return 'custom';
    if (config.resend?.apiKey) return 'resend';
    if (config.smtp?.host && (config.smtp?.user || config.smtp?.port)) return 'smtp';
    return 'none';
  },

  /**
   * Get Resend client instance
   */
  getResendClient: () => {
    if (customResendClient) return customResendClient;
    if (config.resend?.apiKey) {
      return new Resend(config.resend.apiKey);
    }
    return null;
  },

  /**
   * Get SMTP transporter instance
   */
  getTransporter: () => {
    if (customTransporter) return customTransporter;
    if (!config.smtp?.host) return null;

    const transportOptions = {
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.secure,
    };

    if (config.smtp.user && config.smtp.pass) {
      transportOptions.auth = {
        user: config.smtp.user,
        pass: config.smtp.pass,
      };
    }

    return nodemailer.createTransport(transportOptions);
  },

  /**
   * Set custom transporter (useful for testing)
   */
  setTransporter: (transporter) => {
    customTransporter = transporter;
  },

  /**
   * Set custom Resend client (useful for testing)
   */
  setResendClient: (client) => {
    customResendClient = client;
  },

  /**
   * Reset custom clients to default configuration
   */
  resetTransporter: () => {
    customTransporter = null;
    customResendClient = null;
  },

  /**
   * Send campaign report email with attached CSV
   * Uses Resend if RESEND_API_KEY is configured, otherwise falls back to SMTP.
   *
   * @param {Object} params
   * @param {string} params.to - Recipient email address (server-resolved)
   * @param {string} params.reportTitle - Human-readable report title
   * @param {string} params.dateRangeLabel - Formatted date range label (e.g. "Last 7 days")
   * @param {string} params.filename - Attachment filename
   * @param {string} params.csvContent - CSV content string
   * @param {number} [params.recordCount=0] - Number of records in report
   * @returns {Promise<Object>} Provider send result
   */
  sendCampaignReportEmail: async ({
    to,
    reportTitle,
    dateRangeLabel,
    filename,
    csvContent,
    recordCount = 0,
  }) => {
    if (!to || typeof to !== 'string' || !to.includes('@')) {
      throw new Error(`Invalid or missing recipient email address: "${to}"`);
    }

    const subject = `ARCO Communication - ${reportTitle}`;

    const textBody = `Hello,

Your requested ARCO Communication campaign report is attached.

Report: ${reportTitle}
Date Range: ${dateRangeLabel}
Total Records: ${recordCount}

Generated from ARCO Communication.

Regards,
ARCO Communication
`;

    const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
      margin: 0;
      padding: 24px;
    }
    .wrapper {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
    }
    .header {
      background-color: #0d3b30;
      color: #ffffff;
      padding: 24px 28px;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .header p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #a7f3d0;
    }
    .content {
      padding: 28px;
      font-size: 14px;
      line-height: 1.6;
      color: #334155;
    }
    .report-card {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .report-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #edf2f7;
      font-size: 13px;
    }
    .report-row:last-child {
      border-bottom: none;
    }
    .report-label {
      font-weight: 600;
      color: #64748b;
    }
    .report-value {
      font-weight: 600;
      color: #0f172a;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      background: #ecfdf5;
      color: #065f46;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .footer {
      padding: 18px 28px;
      background-color: #f1f5f9;
      font-size: 12px;
      color: #64748b;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>ARCO Communication</h1>
      <p>Custom Campaign Reports</p>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>Your requested campaign report is ready and attached to this email.</p>
      
      <div class="report-card">
        <div class="report-row">
          <span class="report-label">Report Type</span>
          <span class="report-value">${reportTitle}</span>
        </div>
        <div class="report-row">
          <span class="report-label">Date Range</span>
          <span class="report-value">${dateRangeLabel}</span>
        </div>
        <div class="report-row">
          <span class="report-label">Total Records</span>
          <span class="report-value"><span class="badge">${recordCount}</span></span>
        </div>
        <div class="report-row">
          <span class="report-label">Attachment</span>
          <span class="report-value">${filename}</span>
        </div>
      </div>

      <p>The report has been compiled in standard CSV format and attached to this message.</p>
      <p>Generated from <strong>ARCO Communication</strong>.</p>
      <p style="margin-top: 24px;">Regards,<br><strong>ARCO Communication Team</strong></p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} ARCO Communication. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

    // -------------------------------------------------------------------------
    // 1. Custom mock / test transporter takes precedence
    // -------------------------------------------------------------------------
    if (customTransporter) {
      console.log(`[EMAIL SERVICE] Dispatching via Custom/Mock Transporter to: "${to}"`);
      return await customTransporter.sendMail({
        from: config.resend.fromEmail || config.smtp.from,
        to,
        subject,
        text: textBody,
        html: htmlBody,
        attachments: [
          {
            filename,
            content: csvContent,
            contentType: 'text/csv; charset=utf-8',
          },
        ],
      });
    }

    // -------------------------------------------------------------------------
    // 2. Resend (Primary provider when RESEND_API_KEY is configured)
    // -------------------------------------------------------------------------
    const resend = emailService.getResendClient();
    if (resend) {
      const fromEmail = config.resend.fromEmail || 'onboarding@resend.dev';
      const formattedFrom = fromEmail.includes('<') ? fromEmail : `ARCO Communication <${fromEmail}>`;

      console.log(`[EMAIL SERVICE] Dispatching "${reportTitle}" via Resend from "${formattedFrom}" to: "${to}" (Attachment: ${filename})`);
      const { data, error } = await resend.emails.send({
        from: formattedFrom,
        to: [to],
        subject,
        text: textBody,
        html: htmlBody,
        attachments: [
          {
            filename,
            content: Buffer.from(csvContent, 'utf-8'),
          },
        ],
      });

      if (error) {
        console.error('[RESEND API ERROR]:', error);
        throw new Error(`Resend email delivery failed: ${error.message || JSON.stringify(error)}`);
      }

      console.log(`[EMAIL SERVICE SUCCESS] Delivered report email via Resend to "${to}" (ID: ${data?.id || 'sent'})`);
      return data;
    }

    // -------------------------------------------------------------------------
    // 3. Fallback to SMTP if configured
    // -------------------------------------------------------------------------
    const smtpTransporter = emailService.getTransporter();
    if (smtpTransporter) {
      console.log(`[EMAIL SERVICE] Dispatching "${reportTitle}" via SMTP to: "${to}" (Attachment: ${filename})`);
      const mailOptions = {
        from: config.smtp.from,
        to,
        subject,
        text: textBody,
        html: htmlBody,
        attachments: [
          {
            filename,
            content: csvContent,
            contentType: 'text/csv; charset=utf-8',
          },
        ],
      };
      const info = await smtpTransporter.sendMail(mailOptions);
      console.log(`[EMAIL SERVICE SUCCESS] Delivered report email via SMTP to "${to}" (Message ID: ${info?.messageId || 'sent'})`);
      return info;
    }

    // -------------------------------------------------------------------------
    // 4. Neither configured
    // -------------------------------------------------------------------------
    const errMsg = 'Email service is not configured on the server. Please set RESEND_API_KEY (or SMTP credentials).';
    console.error(`[EMAIL SERVICE ERROR] ${errMsg}`);
    throw new Error(errMsg);
  },
};
