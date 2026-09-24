const assert = require('assert');
const path = require('path');
const pg = require('pg');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:2004@127.0.0.1:5432/arco_communication',
});

async function runCampaignReportEmailTests() {
  console.log('================================================================');
  console.log('🧪 ARCO COMMUNICATION - CAMPAIGN REPORT EMAIL TEST SUITE');
  console.log('================================================================\n');

  // Dynamically import ESM services and controllers
  const { emailService } = await import('../services/emailService.js');
  const { analyticsController } = await import('../controllers/analyticsController.js');

  // Track dispatched emails in mock transporter and mock Resend
  const sentSmtpEmails = [];
  const sentResendEmails = [];

  const mockTransporter = {
    sendMail: async (mailOptions) => {
      sentSmtpEmails.push(mailOptions);
      return { messageId: `<mock-smtp-${Date.now()}@arco.com>`, response: '250 OK' };
    },
  };

  const mockResendClient = {
    emails: {
      send: async (payload) => {
        sentResendEmails.push(payload);
        return { data: { id: `resend_${Date.now()}` }, error: null };
      },
    },
  };

  // Helper to create mock response object
  function createMockResponse() {
    return {
      statusCode: 200,
      headers: {},
      jsonData: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        this.jsonData = data;
        return this;
      },
    };
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Resend Provider Unit Verification (onboarding@resend.dev)
    // -------------------------------------------------------------------------
    console.log('Test 1: Resend Provider Dispatch (onboarding@resend.dev, Buffer Attachment)');
    emailService.resetTransporter();
    emailService.setResendClient(mockResendClient);
    sentResendEmails.length = 0;

    await emailService.sendCampaignReportEmail({
      to: 'auth-user@arco.com',
      reportTitle: 'Campaign Summary Report',
      dateRangeLabel: 'Last 7 days',
      filename: 'arco-campaign-summary-report-2026-09-24.csv',
      csvContent: 'Col1,Col2\nVal1,Val2',
      recordCount: 5,
    });

    assert.strictEqual(sentResendEmails.length, 1, 'Exactly one Resend email must be dispatched');
    const resendMsg = sentResendEmails[0];
    assert.deepStrictEqual(resendMsg.to, ['auth-user@arco.com'], 'Recipient must be auth user email');
    assert(resendMsg.from.includes('onboarding@resend.dev'), 'From email must use onboarding@resend.dev');
    assert.strictEqual(resendMsg.subject, 'ARCO Communication - Campaign Summary Report');
    assert(resendMsg.text.includes('Report: Campaign Summary Report'));
    assert(resendMsg.text.includes('Date Range: Last 7 days'));
    assert(resendMsg.html.includes('ARCO Communication'));
    assert.strictEqual(resendMsg.attachments.length, 1);
    assert.strictEqual(resendMsg.attachments[0].filename, 'arco-campaign-summary-report-2026-09-24.csv');
    assert(Buffer.isBuffer(resendMsg.attachments[0].content), 'Attachment must be a Buffer for Resend');
    assert.strictEqual(resendMsg.attachments[0].content.toString('utf-8'), 'Col1,Col2\nVal1,Val2');
    console.log('   ✅ Resend delivered email with onboarding@resend.dev sender and CSV Buffer attachment.\n');

    // -------------------------------------------------------------------------
    // TEST 2: Security - Recipient is authoritative (never trusts frontend email)
    // -------------------------------------------------------------------------
    console.log('Test 2: Security - Frontend-supplied email is completely ignored');
    sentResendEmails.length = 0;

    const reqMalicious = {
      user: { id: 'usr_secure_01', email: 'legitimate-owner@arco.com' },
      body: {
        reportType: 'summary',
        dateRange: { type: 'last7days' },
        email: 'attacker@malicious-domain.com', // Malicious client attempt
      },
    };
    const resMalicious = createMockResponse();

    await analyticsController.generateCampaignReport(reqMalicious, resMalicious, (err) => {
      if (err) throw err;
    });

    assert.strictEqual(resMalicious.statusCode, 200, 'Request must succeed');
    assert.strictEqual(sentResendEmails.length, 1, 'Must dispatch email');
    assert.deepStrictEqual(
      sentResendEmails[0].to,
      ['legitimate-owner@arco.com'],
      'Recipient MUST be authenticated user email, NOT frontend-supplied attacker email'
    );
    assert.strictEqual(
      resMalicious.jsonData.recipientEmail,
      'legitimate-owner@arco.com',
      'Response recipientEmail must reflect authenticated user'
    );
    console.log('   ✅ Proved: Server authoritatively routes report to req.user.email and discards attacker-supplied email.\n');

    // -------------------------------------------------------------------------
    // TEST 3: Report Type 1 - Campaign Summary Report
    // -------------------------------------------------------------------------
    console.log('Test 3: Campaign Summary Report Generation & Email Dispatch');
    sentResendEmails.length = 0;

    const reqSummary = {
      user: { id: 'usr_owner', email: 'owner@arco.com' },
      body: {
        reportType: 'summary',
        dateRange: { type: 'last7days' },
      },
    };
    const resSummary = createMockResponse();

    await analyticsController.generateCampaignReport(reqSummary, resSummary, (err) => {
      if (err) throw err;
    });

    assert.strictEqual(resSummary.statusCode, 200);
    assert.strictEqual(resSummary.jsonData.success, true);
    assert.strictEqual(resSummary.jsonData.data.reportType, 'summary');
    assert.strictEqual(resSummary.jsonData.data.reportTitle, 'Campaign Summary Report');
    assert(resSummary.jsonData.data.csv.startsWith('Campaign Name,Campaign Type,Attempts,Sent,Delivered,Read,Failed,Status,Created At'));
    assert.strictEqual(sentResendEmails.length, 1);
    assert.strictEqual(sentResendEmails[0].subject, 'ARCO Communication - Campaign Summary Report');
    assert(sentResendEmails[0].attachments[0].filename.startsWith('arco-campaign-summary-report-'));
    console.log('   ✅ Campaign Summary Report generated CSV and successfully dispatched.\n');

    // -------------------------------------------------------------------------
    // TEST 4: Report Type 2 - Campaign Detailed Report
    // -------------------------------------------------------------------------
    console.log('Test 4: Campaign Detailed Report Generation & Email Dispatch');
    sentResendEmails.length = 0;

    const reqDetailed = {
      user: { id: 'usr_owner', email: 'owner@arco.com' },
      body: {
        reportType: 'detailed',
        dateRange: { type: 'last30days' },
      },
    };
    const resDetailed = createMockResponse();

    await analyticsController.generateCampaignReport(reqDetailed, resDetailed, (err) => {
      if (err) throw err;
    });

    assert.strictEqual(resDetailed.statusCode, 200);
    assert.strictEqual(resDetailed.jsonData.data.reportType, 'detailed');
    assert.strictEqual(resDetailed.jsonData.data.reportTitle, 'Campaign Detailed Report');
    assert(resDetailed.jsonData.data.csv.startsWith('Campaign Name,Customer Name,Customer Phone,Attempted,Sent,Delivered,Read,Clicks,Failed,Status,Date'));
    assert.strictEqual(sentResendEmails.length, 1);
    assert.strictEqual(sentResendEmails[0].subject, 'ARCO Communication - Campaign Detailed Report');
    assert(sentResendEmails[0].attachments[0].filename.startsWith('arco-campaign-detailed-report-'));
    console.log('   ✅ Campaign Detailed Report generated customer-level delivery logs and dispatched.\n');

    // -------------------------------------------------------------------------
    // TEST 5: Report Type 3 - CTWA Ad Campaign Detailed Report
    // -------------------------------------------------------------------------
    console.log('Test 5: CTWA Ad Campaign Detailed Report Generation & Email Dispatch');
    sentResendEmails.length = 0;

    const reqCtwa = {
      user: { id: 'usr_owner', email: 'owner@arco.com' },
      body: {
        reportType: 'ctwa',
        dateRange: { type: 'last7days' },
      },
    };
    const resCtwa = createMockResponse();

    await analyticsController.generateCampaignReport(reqCtwa, resCtwa, (err) => {
      if (err) throw err;
    });

    assert.strictEqual(resCtwa.statusCode, 200);
    assert.strictEqual(resCtwa.jsonData.data.reportType, 'ctwa');
    assert.strictEqual(resCtwa.jsonData.data.reportTitle, 'CTWA Ad Campaign Detailed Report');
    assert(resCtwa.jsonData.data.csv.startsWith('Campaign Name,Campaign Type,Ad ID,Impressions,Clicks,Conversations Started,Cost,Status'));
    assert.strictEqual(sentResendEmails.length, 1);
    assert.strictEqual(sentResendEmails[0].subject, 'ARCO Communication - CTWA Ad Campaign Detailed Report');
    assert(sentResendEmails[0].attachments[0].filename.startsWith('arco-ctwa-detailed-report-'));
    console.log('   ✅ CTWA Ad Campaign Report generated Meta Ads metrics and dispatched.\n');

    // -------------------------------------------------------------------------
    // TEST 6: Date Range Validation (Custom dates, boundaries, max 31 days limit)
    // -------------------------------------------------------------------------
    console.log('Test 6: Date Range Validation');

    // 6a: Custom date range exceeding 31 days
    const reqTooLong = {
      user: { id: 'usr_owner', email: 'owner@arco.com' },
      body: {
        reportType: 'summary',
        dateRange: {
          type: 'custom',
          from: '2026-08-01',
          to: '2026-09-24', // 54 days > 31 days limit
        },
      },
    };
    const resTooLong = createMockResponse();
    await analyticsController.generateCampaignReport(reqTooLong, resTooLong, () => {});
    assert.strictEqual(resTooLong.statusCode, 400, 'Must reject custom date ranges > 31 days');
    assert(resTooLong.jsonData.message.includes('cannot exceed 31 days'));
    console.log('   ✅ 31-day custom range limit enforced.');

    // 6b: Custom date range where from > to
    const reqInverted = {
      user: { id: 'usr_owner', email: 'owner@arco.com' },
      body: {
        reportType: 'summary',
        dateRange: {
          type: 'custom',
          from: '2026-09-24',
          to: '2026-09-20',
        },
      },
    };
    const resInverted = createMockResponse();
    await analyticsController.generateCampaignReport(reqInverted, resInverted, () => {});
    assert.strictEqual(resInverted.statusCode, 400, 'Must reject from > to');
    console.log('   ✅ Inverted dates rejected.');

    // 6c: Valid custom date range within 31 days
    sentResendEmails.length = 0;
    const reqValidCustom = {
      user: { id: 'usr_owner', email: 'owner@arco.com' },
      body: {
        reportType: 'summary',
        dateRange: {
          type: 'custom',
          from: '2026-09-20',
          to: '2026-09-24',
        },
      },
    };
    const resValidCustom = createMockResponse();
    await analyticsController.generateCampaignReport(reqValidCustom, resValidCustom, () => {});
    assert.strictEqual(resValidCustom.statusCode, 200, 'Valid custom range must succeed');
    assert.strictEqual(sentResendEmails.length, 1);
    assert(sentResendEmails[0].text.includes('Date Range: 2026-09-20 to 2026-09-24'));
    console.log('   ✅ Valid custom date range accepted and reflected in email.\n');

    // -------------------------------------------------------------------------
    // TEST 7: Invalid Report Type
    // -------------------------------------------------------------------------
    console.log('Test 7: Invalid Report Type Rejection');
    const reqInvalidType = {
      user: { id: 'usr_owner', email: 'owner@arco.com' },
      body: {
        reportType: 'super_secret_internal_report',
        dateRange: { type: 'last7days' },
      },
    };
    const resInvalidType = createMockResponse();
    await analyticsController.generateCampaignReport(reqInvalidType, resInvalidType, () => {});
    assert.strictEqual(resInvalidType.statusCode, 400, 'Invalid report type must return 400');
    console.log('   ✅ Unsupported report types rejected.\n');

    // -------------------------------------------------------------------------
    // TEST 8: Missing User Email in Context & DB
    // -------------------------------------------------------------------------
    console.log('Test 8: User with No Email Handling');
    const reqNoEmail = {
      user: { id: 'usr_non_existent_9999', email: null },
      body: {
        reportType: 'summary',
        dateRange: { type: 'last7days' },
      },
    };
    const resNoEmail = createMockResponse();
    await analyticsController.generateCampaignReport(reqNoEmail, resNoEmail, () => {});
    assert.strictEqual(resNoEmail.statusCode, 400, 'Missing email must return 400');
    assert(resNoEmail.jsonData.message.includes('No verified email address'));
    console.log('   ✅ Account without email safely rejected with clear guidance.\n');

    // -------------------------------------------------------------------------
    // TEST 9: Resend Error Handling (502 Gateway Error, Safe Message)
    // -------------------------------------------------------------------------
    console.log('Test 9: Resend API Failure Safe Handling (502 Gateway Error)');
    const failingResendClient = {
      emails: {
        send: async () => {
          return { data: null, error: { message: 'API rate limit exceeded', name: 'rate_limit_exceeded' } };
        },
      },
    };
    emailService.setResendClient(failingResendClient);

    const reqFail = {
      user: { id: 'usr_owner', email: 'owner@arco.com' },
      body: {
        reportType: 'summary',
        dateRange: { type: 'last7days' },
      },
    };
    const resFail = createMockResponse();
    await analyticsController.generateCampaignReport(reqFail, resFail, () => {});
    assert.strictEqual(resFail.statusCode, 502, 'Provider failure must return 502 status');
    assert.strictEqual(resFail.jsonData.success, false);
    assert(resFail.jsonData.message.includes('Unable to deliver report email'));
    console.log('   ✅ Resend API errors handled safely without leaks.\n');

    // -------------------------------------------------------------------------
    // TEST 10: Fallback / Alternative SMTP Transporter
    // -------------------------------------------------------------------------
    console.log('Test 10: Fallback to Custom / SMTP Transporter');
    emailService.resetTransporter();
    emailService.setTransporter(mockTransporter);
    sentSmtpEmails.length = 0;

    const reqSmtp = {
      user: { id: 'usr_owner', email: 'owner@arco.com' },
      body: {
        reportType: 'summary',
        dateRange: { type: 'last7days' },
      },
    };
    const resSmtp = createMockResponse();
    await analyticsController.generateCampaignReport(reqSmtp, resSmtp, () => {});
    assert.strictEqual(resSmtp.statusCode, 200);
    assert.strictEqual(sentSmtpEmails.length, 1);
    assert.strictEqual(sentSmtpEmails[0].to, 'owner@arco.com');
    console.log('   ✅ Custom / SMTP transporter remains fully operational as a fallback.\n');

    // Reset transporter
    emailService.resetTransporter();

    console.log('================================================================');
    console.log('🎉 ALL CAMPAIGN REPORT EMAIL TESTS PASSED SUCCESSFULLY (10/10)');
    console.log('================================================================');
  } finally {
    await pool.end();
  }
}

runCampaignReportEmailTests().catch((err) => {
  console.error('❌ Test execution failed:', err);
  process.exit(1);
});
