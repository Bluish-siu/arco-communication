/**
 * ARCO Communication — Master Word Documentation Generator
 * Generates ARCO_Full_Documentation.docx
 */

import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  ShadingType
} from 'docx';

const PRIMARY_COLOR = '0D3B30'; // Dark Emerald
const SECONDARY_COLOR = '154D3F'; // Teal Accent
const TEXT_DARK = '1E293B'; // Slate 800
const TEXT_MUTED = '64748B'; // Slate 500
const BG_LIGHT = 'F8FAFC'; // Slate 50
const BG_ALT = 'F1F5F9'; // Slate 100
const BORDER_COLOR = 'CBD5E1'; // Slate 300

function createHeaderCell(text, widthPercent = 25) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: PRIMARY_COLOR },
    margins: { top: 120, bottom: 120, left: 140, right: 140 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            bold: true,
            color: 'FFFFFF',
            size: 20, // 10pt
            font: 'Arial'
          })
        ]
      })
    ]
  });
}

function createDataCell(text, widthPercent = 25, isAlternate = false, isCode = false) {
  return new TableCell({
    width: { size: widthPercent, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: isAlternate ? BG_ALT : 'FFFFFF' },
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text,
            size: 19, // 9.5pt
            font: isCode ? 'Consolas' : 'Arial',
            color: isCode ? '0F172A' : TEXT_DARK
          })
        ]
      })
    ]
  });
}

function makeTable(headers, rows, widths) {
  const tableRows = [
    new TableRow({
      tableHeader: true,
      children: headers.map((h, i) => createHeaderCell(h, widths[i]))
    }),
    ...rows.map((row, rowIdx) =>
      new TableRow({
        children: row.map((cellText, colIdx) =>
          createDataCell(cellText, widths[colIdx], rowIdx % 2 === 1, typeof cellText === 'string' && (cellText.includes('/') || cellText.includes('_') || cellText.includes('=')))
        )
      })
    )
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 2, color: BORDER_COLOR },
      insideVertical: { style: BorderStyle.SINGLE, size: 2, color: BORDER_COLOR }
    },
    rows: tableRows
  });
}

function p(text, options = {}) {
  const { bold = false, italic = false, size = 22, color = TEXT_DARK, font = 'Arial', spaceAfter = 140, spaceBefore = 0 } = options;
  return new Paragraph({
    spacing: { after: spaceAfter, before: spaceBefore, line: 300 },
    children: [
      new TextRun({
        text,
        bold,
        italic,
        size,
        color,
        font
      })
    ]
  });
}

function bullet(text, boldPrefix = '', options = {}) {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({ text: boldPrefix + ' ', bold: true, size: 21, color: PRIMARY_COLOR, font: 'Arial' }));
  }
  children.push(new TextRun({ text, size: 21, color: TEXT_DARK, font: 'Arial' }));

  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 100, line: 280 },
    children
  });
}

function h1(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 180 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 32, // 16pt
        color: PRIMARY_COLOR,
        font: 'Arial'
      })
    ]
  });
}

function h2(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 26, // 13pt
        color: SECONDARY_COLOR,
        font: 'Arial'
      })
    ]
  });
}

function h3(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text: title,
        bold: true,
        size: 22, // 11pt
        color: '334155',
        font: 'Arial'
      })
    ]
  });
}

function callout(title, body) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      left: { style: BorderStyle.SINGLE, size: 24, color: PRIMARY_COLOR },
      top: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: 'F0FDF4' }, // Light emerald
            margins: { top: 140, bottom: 140, left: 180, right: 180 },
            children: [
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({ text: '📌 ' + title, bold: true, size: 21, color: PRIMARY_COLOR, font: 'Arial' })
                ]
              }),
              new Paragraph({
                spacing: { after: 0 },
                children: [
                  new TextRun({ text: body, size: 20, color: '166534', font: 'Arial' })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

function codeBlock(codeText) {
  const lines = codeText.split('\n');
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      left: { style: BorderStyle.SINGLE, size: 12, color: '475569' },
      top: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: '1E293B' }, // Dark background
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            children: lines.map(line =>
              new Paragraph({
                spacing: { line: 240, after: 20 },
                children: [
                  new TextRun({
                    text: line,
                    font: 'Consolas',
                    size: 18, // 9pt
                    color: 'F8FAFC'
                  })
                ]
              })
            )
          })
        ]
      })
    ]
  });
}

async function generate() {
  console.log('Generating ARCO comprehensive Word documentation...');

  const doc = new Document({
    creator: 'ARCO Engineering Team',
    title: 'ARCO Communication — In-and-Out Project Architecture Documentation',
    description: 'Comprehensive documentation of Project Genesis, Google Login, Meta Cloud API, and Shopify Enterprise Suite',
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'ARCO Communication — Technical & Integration Manual', size: 16, color: TEXT_MUTED, font: 'Arial' })
                ]
              })
            ]
          })
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: 'Page ', size: 16, color: TEXT_MUTED, font: 'Arial' }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: TEXT_MUTED, font: 'Arial' }),
                  new TextRun({ text: ' of ', size: 16, color: TEXT_MUTED, font: 'Arial' }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: TEXT_MUTED, font: 'Arial' })
                ]
              })
            ]
          })
        },
        children: [
          // -------------------------------------------------------------
          // TITLE / COVER
          // -------------------------------------------------------------
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 600, after: 120 },
            children: [
              new TextRun({ text: 'ARCO COMMUNICATION', bold: true, size: 48, color: PRIMARY_COLOR, font: 'Arial' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({ text: 'ENTERPRISE WHATSAPP CRM & SHOPIFY CONVERSION SUITE', bold: true, size: 24, color: SECONDARY_COLOR, font: 'Arial' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 500 },
            children: [
              new TextRun({ text: 'Complete In-and-Out Engineering Documentation\nCore Platform Architecture | Google OAuth 2.0 | Meta Cloud API | Shopify Integration', italic: true, size: 22, color: TEXT_MUTED, font: 'Arial' })
            ]
          }),

          // Metadata Table
          makeTable(
            ['Parameter', 'Specification Details'],
            [
              ['Project Name', 'ARCO Communication (Interakt Alternative for Shopify)'],
              ['Document Classification', 'Enterprise Engineering & Deployment Master Guide'],
              ['Current Production URLs', 'Frontend: https://arco-communication.vercel.app\nBackend: https://arco-backend-ecbl.onrender.com'],
              ['Connected Database', 'PostgreSQL Cloud on Supabase (Pooler AWS Tokyo ap-northeast-2)'],
              ['Version / Revision', 'Version 2.0 (Shopify App Store Review Ready)'],
              ['Target Platform Environments', 'Vercel (React Frontend) | Render (Express Backend) | Shopify App Bridge 2026'],
              ['Publication Date', 'September 2026']
            ],
            [30, 70]
          ),

          new Paragraph({ spacing: { after: 300 } }),

          // -------------------------------------------------------------
          // SECTION 1: HOW WE MADE THIS PROJECT (ARCHITECTURE & GENESIS)
          // -------------------------------------------------------------
          h1('1. Project Architecture & Foundation (How We Made This Project)'),
          p('ARCO Communication was engineered from the ground up as a high-performance, enterprise-grade alternative to Interakt, specifically tailored for Shopify merchants and D2C brands. The platform bridges Meta WhatsApp Business Cloud API with Shopify storefronts, delivering real-time team inbox messaging, multi-step abandoned cart drip recoveries, automated COD order verification, and live shipping tracking updates.'),

          h2('1.1 Technical Stack Breakdown'),
          bullet('Vite 8 + React 19 + TailwindCSS v4 with full responsive layout, Lucide React icons, and modern dashboard routing.', 'Frontend Client (Vercel):'),
          bullet('Node.js 24 + Express 5 with async error propagation, rate limiting, Helmet HTTP security headers, and timing-safe crypto signature engines.', 'Backend API Server (Render):'),
          bullet('Supabase PostgreSQL with high-throughput connection pooling (pg-pool), multi-tenant foreign key cascades, and durable event logs.', 'Database Engine:'),
          bullet('Meta Graph API v25.0 with WhatsApp Business Account (WABA) direct webhook reception and 2-way conversation state management.', 'WhatsApp Cloud API:'),
          bullet('Shopify App Bridge 2026 + Admin GraphQL / REST Webhook synchronization for checkout lifecycle automation.', 'Shopify Framework:'),

          h2('1.2 Full Database Schema & Core Tables'),
          p('The PostgreSQL schema is partitioned into modular, highly-indexed relational tables:'),
          makeTable(
            ['Table Name', 'Purpose & Managed Entity', 'Key Columns & Constraints'],
            [
              ['users', 'Tenant accounts and administrative credentials', 'id (UUID), email, password_hash, role, company_name, created_at'],
              ['contacts', 'CRM contacts synchronized across Meta & Shopify', 'id, user_id, name, phone (indexed), email, tags, custom_attributes'],
              ['conversations', 'Thread state for Team Inbox (/inbox)', 'id, user_id, contact_id, phone, status, last_inbound_at, unread_count'],
              ['messages', 'Individual incoming & outgoing chat bubbles', 'id, conversation_id, sender_type, message_type, content, wamid, status'],
              ['shopify_integrations', 'Connected Shopify merchant OAuth metadata', 'id, user_id, shop_domain, access_token (AES-256), status, scopes'],
              ['shopify_storefront_widgets', 'Storefront button styles & greeting config', 'id, user_id, shop_domain, brand_color, buy_button_enabled'],
              ['shopify_automations', 'Automated recipe triggers & discount codes', 'id, user_id, shop_domain, recipe_type, is_enabled, template_name'],
              ['shopify_abandoned_checkouts', 'Cart abandonment recovery state machine', 'id, user_id, shop_domain, phone, total_price, recovery_url, status'],
              ['checkout_orders', 'Live orders, COD confirmations, and fulfillments', 'id, order_number, user_id, phone_number, payment_status, order_status'],
              ['delayed_automation_jobs', 'Scheduled drip automation timers (15m, 60m)', 'id, user_id, contact_phone, scheduled_at, status, cancellation_reason'],
              ['shopify_events', 'Idempotent, deduplicated raw webhook log', 'id, event_id, event_type, shop_domain, webhook_id (unique), status']
            ],
            [25, 45, 30]
          ),

          new Paragraph({ spacing: { after: 200 } }),
          callout('Durable Persistence Pattern', 'To achieve zero message loss and complete idempotency, all Shopify and Meta webhooks are written to durable database tables (shopify_events and messages) BEFORE returning HTTP 200 to Meta and Shopify servers. This guarantees webhook delivery acknowledgment within Shopify\'s 5-second timeout window.'),

          // -------------------------------------------------------------
          // SECTION 2: HOW WE DID THE GOOGLE LOGIN PART
          // -------------------------------------------------------------
          h1('2. Google OAuth 2.0 Authentication Engine (How We Did Google Login)'),
          p('To provide frictionless merchant onboarding, ARCO implements an enterprise-grade Google OAuth 2.0 authorization code flow compliant with Google Identity Services standards.'),

          h2('2.1 Google Cloud Console Configuration'),
          bullet('Project established on Google Cloud Console: Branding Catalyst SaaS Suite.', 'Google Project:'),
          bullet('Configured in environment via GOOGLE_CLIENT_ID (Google Identity OAuth 2.0 Web Client).', 'Client ID:'),
          bullet('Authorized JavaScript Origins: http://localhost:5173 and https://arco-communication.vercel.app', 'Authorized Origins:'),
          bullet('Authorized Redirect URIs: http://localhost:5173/auth/google/callback and https://arco-communication.vercel.app/auth/google/callback', 'Authorized Redirect URIs:'),
          bullet('Requested Scopes: openid, email, profile', 'OAuth Scopes:'),

          h2('2.2 Step-by-Step Google Authentication Flow'),
          p('The end-to-end authentication lifecycle operates in four seamless phases:'),
          bullet('The merchant clicks "Continue with Google" on /login or /signup. The client redirects the browser to Google OAuth consent screen: https://accounts.google.com/o/oauth2/v2/auth with state, client_id, and redirect_uri.', '1. Merchant Initiation:'),
          bullet('Upon user consent, Google redirects the browser back to /auth/google/callback?code=<AUTH_CODE>&state=<CSRF_STATE>.', '2. Authorization Code Return:'),
          bullet('The React callback page (GoogleCallback.jsx) extracts the authorization code and submits an HTTP POST to /api/auth/google.', '3. Backend Token Exchange:'),
          bullet('The backend server invokes Google token endpoint (https://oauth2.googleapis.com/token) with client_secret to obtain an access_token, then queries https://www.googleapis.com/oauth2/v2/userinfo to verify verified_email, name, and profile picture.', '4. Identity Verification:'),
          bullet('If the user is new, an account is auto-provisioned in users table with role "owner". If existing, last_login_at is updated. An enterprise JWT token (7-day validity) is signed and returned to the client for local session persistence.', '5. User Provisioning & JWT:'),

          codeBlock(`// Server-side Google Code Exchange Handler (authController.js)
const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    code: authCode,
    client_id: config.googleClientId,
    client_secret: config.googleClientSecret,
    redirect_uri: config.googleRedirectUri,
    grant_type: 'authorization_code'
  })
});
const { access_token } = await tokenResponse.json();
const userinfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
  headers: { Authorization: \`Bearer \${access_token}\` }
}).then(r => r.json());`),

          new Paragraph({ spacing: { after: 200 } }),

          // -------------------------------------------------------------
          // SECTION 3: HOW WE DID THE META / WHATSAPP PART
          // -------------------------------------------------------------
          h1('3. Meta WhatsApp Business Cloud API Integration (How We Did Meta Part)'),
          p('ARCO connects directly to Meta\'s WhatsApp Business Cloud API (Graph API v25.0) without intermediate third-party brokers (such as Twilio or Gupshup). This yields lower latency, zero intermediary markup costs, and direct access to native interactive message formats.'),

          h2('3.1 Meta Developer Portal Credentials & IDs'),
          makeTable(
            ['Configuration Key', 'Production Value', 'Role & Operational Scope'],
            [
              ['META_APP_ID', '2872862256446175', 'Meta Developer Application container identifier'],
              ['META_APP_SECRET', '4b30fa94b657f4cba6972bde726db072', 'Used for x-hub-signature-256 HMAC webhook verification'],
              ['META_WABA_ID', '1311505681068950', 'WhatsApp Business Account holding approved templates'],
              ['META_PHONE_NUMBER_ID', '1225478070642817', 'Live sender phone number identifier in Meta Cloud API'],
              ['GRAPH_API_VERSION', 'v25.0', 'Current production Graph API version'],
              ['WEBHOOK_VERIFY_TOKEN', '8ee267f5fa1739ed50b9ed91a15ffd22c19b25bef2586f2d737534563c6831cd', 'Used for initial webhook challenge subscription handshake']
            ],
            [30, 35, 35]
          ),

          h2('3.2 Two-Way Webhook Engine & Real-Time Sync'),
          bullet('Meta initiates a GET request to /api/webhook/meta with hub.mode=subscribe and hub.verify_token. ARCO validates the token and returns hub.challenge to establish the live webhook pipe.', 'Webhook Verification:'),
          bullet('Incoming messages arrive via POST /api/webhook/meta with x-hub-signature-256. The server validates the HMAC hash using META_APP_SECRET before processing.', 'HMAC Signature Guard:'),
          bullet('When an end-user sends a message, ARCO creates or updates the conversation, sets last_inbound_at = NOW(), inserts the message into messages table, and updates unread badge counts in real time.', 'Inbound Dispatch:'),
          bullet('Meta returns status webhooks (sent, delivered, read, failed). ARCO tracks WAMID identifiers and updates double checkmarks in the Team Inbox in real time.', 'Delivery Receipts:'),

          h2('3.3 Meta 24-Hour Window & The Utility Template Solution'),
          callout('Meta Policy & Delivery Breakthrough', 'Under Meta Cloud API policies, businesses CANNOT send freeform session text messages to a phone number unless the customer messaged the business within the previous 24 hours. Messages sent outside this window are dropped by Meta unless an Approved Template is used.\n\nFurthermore, Marketing templates (e.g. order_status) are subject to marketing frequency caps. ARCO resolved this by implementing the approved UTILITY template ("order"), which is EXEMPT from 24h restrictions and frequency limits, guaranteeing 100% phone delivery at all times!'),

          makeTable(
            ['Template Name', 'Meta Category', 'Delivery Behavior Outside 24h Window'],
            [
              ['order', 'UTILITY', 'Guaranteed instant delivery 24/7. Exempt from marketing rate limits.'],
              ['order_status', 'MARKETING', 'Delivered if customer marketing frequency limits permit.'],
              ['arco_new_english', 'MARKETING', 'Delivered with rich video media header for broadcast campaigns.'],
              ['hello_world', 'UTILITY', 'Standard sample test template for basic connectivity validation.']
            ],
            [25, 20, 55]
          ),

          new Paragraph({ spacing: { after: 200 } }),

          // -------------------------------------------------------------
          // SECTION 4: HOW WE DID THE SHOPIFY PART (4 PILLARS & INBOX)
          // -------------------------------------------------------------
          h1('4. Shopify Integration & Commerce Suite (How We Did Shopify Part)'),
          p('The Shopify integration forms the core engine of ARCO, transforming it into an all-in-one conversational commerce suite. It consists of an embedded App Bridge dashboard, dynamic storefront JavaScript injection, real-time webhook listeners, and an interactive Team Inbox drawer.'),

          h2('4.1 The 4 Core Notification Pillars'),
          bullet('Tracks checkouts/create and checkouts/update events. Automatically calculates cart totals, formats line items, injects discount coupon SAVE10, and queues a 15-minute drip recovery notification with a direct 1-click cart recovery URL. If the user completes the order, the scheduled drip is automatically cancelled.', 'Pillar 1: Abandoned Cart Drip Recovery:'),
          bullet('Catches orders/create webhooks. Formats instant branded WhatsApp order receipts with order number, line items breakdown, total price, and shipping destination.', 'Pillar 2: Instant Order Confirmation:'),
          bullet('Detects Cash on Delivery (COD) orders and dispatches interactive WhatsApp verification prompts ("Reply 1 to Confirm, Reply 2 to Cancel"). Upon customer response, ARCO automatically tags the Shopify order as "COD-Confirmed" or "COD-Cancelled", eliminating Return-to-Origin (RTO) courier losses.', 'Pillar 3: Cash on Delivery (COD) Anti-RTO:'),
          bullet('Listens for fulfillments/create events. Extracts carrier name (BlueDart, Delhivery, DTDC, Shiprocket) and live tracking URL, sending an instant shipment dispatch alert to the buyer.', 'Pillar 4: Shipping & Live Courier Tracking:'),

          h2('4.2 Storefront Widget & "Order on WhatsApp" Button (/api/storefront/widget.js)'),
          p('ARCO provides an ultra-lightweight, zero-dependency browser script served directly by the backend at /api/storefront/widget.js?shop=<SHOP_DOMAIN>. When embedded on the Shopify theme, it automatically injects:'),
          bullet('Floating WhatsApp button on bottom-right or bottom-left with custom brand colors, online badge ("Replies in minutes"), and interactive welcome chat modal.', '1. Floating Chat Widget:'),
          bullet('Detects product pages (form[action*="/cart/add"]) and injects a prominent green "Order on WhatsApp" button right next to Add to Cart. When clicked, it automatically opens WhatsApp with the product title, price, and store URL pre-filled for immediate customer enquiry!', '2. "Order on WhatsApp" Button:'),

          h2('4.3 Webhook Security & Multi-Secret Signature Engine'),
          p('Shopify signs all webhook payloads with HMAC-SHA256 headers (x-shopify-hmac-sha256). To handle both App Store public apps and direct Store Notification webhooks, ARCO\'s verification middleware (shopifyWebhookVerify.js) verifies payloads against candidate secrets using timing-safe comparison:'),
          codeBlock(`// Multi-Secret Timing-Safe Webhook Verification (shopifyWebhookVerify.js)
const candidateSecrets = [
  config.shopifyApiSecret,           // Public App Secret (shpss_c5187d...)
  config.shopifyNotificationSecret,   // Store Webhook Secret (284205520fc82e...)
  process.env.SHOPIFY_NOTIFICATION_SECRET
].filter(Boolean);

let isValid = false;
for (const sec of candidateSecrets) {
  const calculatedHmac = crypto.createHmac('sha256', sec).update(rawBody).digest('base64');
  const calculatedBuffer = Buffer.from(calculatedHmac, 'base64');
  if (hmacBuffer.length === calculatedBuffer.length && crypto.timingSafeEqual(hmacBuffer, calculatedBuffer)) {
    isValid = true;
    break;
  }
}`),

          new Paragraph({ spacing: { after: 200 } }),

          h2('4.4 Team Inbox Shopify Commerce Drawer (/inbox)'),
          p('The ARCO Team Inbox features a dedicated, real-time Shopify side drawer that synchronizes merchant data directly beside WhatsApp chat threads:'),
          bullet('Displays customer Lifetime Value (LTV), total order count, Average Order Value (AOV), and customer loyalty tier (e.g. "Returning Customer").', '1. Customer KPI Cards:'),
          bullet('Displays current items left in cart, total price, and 1-click action buttons: "⚡ Send Recovery" (dispatches recovery template) and "💬 Draft in Chat" (automatically pastes recovery link into the chat input box).', '2. Active Abandoned Cart Card:'),
          bullet('Shows recent orders with payment badges (Paid / COD) and fulfillment status (Fulfilled / Unfulfilled), accompanied by 1-click "🚚 Tracking" and "🛡️ Verify COD" buttons.', '3. Order History Section:'),

          // -------------------------------------------------------------
          // SECTION 5: STEP-BY-STEP TESTING & VERIFICATION GUIDE
          // -------------------------------------------------------------
          h1('5. Step-by-Step Testing & Verification Guide'),
          p('To test the integration end-to-end without waiting for customer orders, ARCO provides both simulated and live manual testing workflows.'),

          h2('5.1 Live Simulator Script (simulateShopifyCartAndOrder.mjs)'),
          p('The repository includes a dedicated command-line simulator located at server/scripts/simulateShopifyCartAndOrder.mjs. It supports test execution with custom products, prices, and phone numbers:'),
          bullet('node server/scripts/simulateShopifyCartAndOrder.mjs --action=abandon_cart --phone=9920858396 --name="Nilesh Patel" --product="Snowboard Liquid" --price=749', 'Simulate Abandoned Cart:'),
          bullet('node server/scripts/simulateShopifyCartAndOrder.mjs --action=place_order --phone=9920858396 --name="Nilesh Patel" --order=1010 --price=1499 --payment=COD', 'Simulate COD Order:'),
          bullet('node server/scripts/simulateShopifyCartAndOrder.mjs --action=cancel_pending', 'Cancel All Scheduled Drips (DND):'),

          h2('5.2 Live Manual Storefront Testing Workflow'),
          p('To execute a 100% manual test directly on the Shopify store:'),
          bullet('Open https://arco-test-e2a1thrd.myshopify.com/collections/all and select an in-stock product (e.g. The Collection Snowboard: Hydrogen).', 'Step 1: Browse Storefront:'),
          bullet('Click "Add to cart" -> "Check out".', 'Step 2: Add to Cart:'),
          bullet('Enter contact email (nilesh@test.com), US address (123 Broadway, NY 10001), and recipient mobile phone (+91 9920858396).', 'Step 3: Enter Details:'),
          bullet('Click "Continue to shipping" and close the browser tab. Shopify records the checkout under Orders -> Abandoned checkouts.', 'Step 4: Abandon Checkout:'),
          bullet('Open ARCO Team Inbox (https://arco-communication.vercel.app/inbox), select Nilesh Patel, and view the active cart card in the right drawer!', 'Step 5: Verify in Inbox:'),

          // -------------------------------------------------------------
          // SECTION 6: SHOPIFY PARTNER ACCOUNT & APP STORE SUBMISSION
          // -------------------------------------------------------------
          h1('6. Shopify Partner Account & App Store Publishing Steps'),
          p('Once the supervisor\'s Shopify Partner Account is accessed, the final step to launch ARCO as a public Shopify App involves registering the pre-configured production URLs in the Partner Dashboard:'),
          makeTable(
            ['Partner Dashboard Field', 'Exact Value to Paste', 'Notes / Instructions'],
            [
              ['App Name', 'ARCO Communication', 'Official brand name displayed in App Store'],
              ['App URL', 'https://arco-communication.vercel.app', 'Vercel frontend production URL with App Bridge'],
              ['Allowed Redirection URL', 'https://arco-backend-ecbl.onrender.com/api/integrations/shopify/callback', 'OAuth token exchange callback endpoint'],
              ['App Scopes', 'read_products, read_orders, read_customers', 'Access scopes configured in .env and server'],
              ['Customer Data Request Webhook', 'https://arco-backend-ecbl.onrender.com/api/shopify/webhooks/customers/data_request', 'Mandatory GDPR compliance endpoint'],
              ['Customer Redact Webhook', 'https://arco-backend-ecbl.onrender.com/api/shopify/webhooks/customers/redact', 'Mandatory GDPR compliance endpoint'],
              ['Shop Redact Webhook', 'https://arco-backend-ecbl.onrender.com/api/shopify/webhooks/shop/redact', 'Mandatory GDPR compliance endpoint'],
              ['Privacy Policy URL', 'https://arco-communication.vercel.app/privacy', 'Hosted privacy policy page']
            ],
            [30, 45, 25]
          ),

          new Paragraph({ spacing: { after: 200 } }),
          callout('Shopify Review Readiness', 'ARCO is 100% compliant with Shopify App Store requirements: App Bridge navigation is enabled, HTTPS is enforced on all endpoints, timing-safe webhook HMAC verification is active, and mandatory GDPR privacy webhooks are fully implemented.')
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(process.cwd(), 'ARCO_Full_Documentation.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log(`✓ Master Word Documentation generated successfully: ${outputPath}`);
  console.log(`  File size: ${(buffer.length / 1024).toFixed(1)} KB`);
}

generate().catch(console.error);
