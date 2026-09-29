# ARCO Communication — Enterprise Technical Architecture & Integration Manual

> **Complete In-and-Out Engineering Guide**  
> **Core Architecture | Google OAuth 2.0 | Meta Cloud API | Shopify Enterprise Suite**  
> *Generated on September 29, 2026 for Executive & Developer Handover*

---

## 1. Project Genesis & Core Architecture (How We Made This Project)

### 1.1 Executive Overview
**ARCO Communication** is a full-featured conversational commerce platform and team inbox designed as a high-performance alternative to **Interakt** for Shopify D2C merchants. The system automates:
* **Abandoned Cart Drip Recoveries** with dynamic discount codes.
* **Instant Branded Order Confirmations**.
* **Cash on Delivery (COD) Anti-RTO Order Verification** with automated Shopify tagging.
* **Live Courier Tracking Updates** (BlueDart, Delhivery, DTDC, Shiprocket).
* **Multi-Agent Team Inbox** (`/inbox`) embedded directly inside Shopify Admin with a real-time Shopify customer drawer.

---

### 1.2 Technology Stack
* **Frontend Web App**: React 19, Vite 8, TailwindCSS v4, Lucide React, App Bridge 2026. Hosted on **Vercel** (`https://arco-communication.vercel.app`).
* **Backend API Server**: Node.js 24, Express 5, Helmet, CORS, timing-safe crypto HMAC engines. Hosted on **Render** (`https://arco-backend-ecbl.onrender.com`).
* **Database**: PostgreSQL hosted on **Supabase Cloud** (Tokyo `ap-northeast-2` connection pooling via `pg-pool`).
* **WhatsApp Cloud API**: Meta Graph API v25.0 direct WABA integration.
* **Shopify Framework**: Shopify App Bridge 2026, Admin GraphQL & REST API, Webhooks.

---

### 1.3 PostgreSQL Database Schema
| Table Name | Purpose & Managed Entity | Key Columns & Constraints |
| :--- | :--- | :--- |
| `users` | Multi-tenant merchant accounts & auth | `id` (UUID), `email`, `password_hash`, `role`, `company_name` |
| `contacts` | Unified CRM contact directory | `id`, `user_id`, `name`, `phone` (indexed), `email`, `tags` |
| `conversations`| Active threads in Team Inbox | `id`, `user_id`, `contact_id`, `phone`, `status`, `last_inbound_at` |
| `messages` | Chat history bubbles | `id`, `conversation_id`, `sender_type`, `content`, `wamid`, `status` |
| `shopify_integrations` | Connected Shopify store metadata | `id`, `user_id`, `shop_domain`, `access_token` (AES-256), `status` |
| `shopify_storefront_widgets` | Storefront button customization | `id`, `shop_domain`, `brand_color`, `buy_button_enabled` |
| `shopify_automations` | 4 Pillar automation rules | `id`, `shop_domain`, `recipe_type`, `is_enabled`, `template_name` |
| `shopify_abandoned_checkouts` | Cart abandonment recovery state | `id`, `shop_domain`, `phone`, `total_price`, `recovery_url`, `status` |
| `checkout_orders`| Real-time Shopify orders & COD state | `id`, `order_number`, `phone_number`, `payment_status`, `order_status` |
| `delayed_automation_jobs` | Background drip timers (15m, 60m) | `id`, `contact_phone`, `scheduled_at`, `status`, `cancellation_reason` |
| `shopify_events` | Idempotent raw webhook log | `id`, `event_id`, `shop_domain`, `webhook_id` (unique), `status` |

---

## 2. Google OAuth 2.0 Integration (How We Did Google Login)

### 2.1 Google Cloud Console Setup
* **Project**: Branding Catalyst SaaS Suite
* **Client ID**: Configured via `GOOGLE_CLIENT_ID` in `.env` (Google Identity Console OAuth 2.0 Web Client)
* **Client Secret**: Configured securely via `GOOGLE_CLIENT_SECRET` in `.env`
* **Authorized Origins**: `http://localhost:5173`, `https://arco-communication.vercel.app`
* **Authorized Redirect URIs**: `http://localhost:5173/auth/google/callback`, `https://arco-communication.vercel.app/auth/google/callback`
* **Scopes**: `openid`, `email`, `profile`

### 2.2 Execution Flow
1. Merchant clicks **"Continue with Google"** on Login / Signup.
2. Redirected to Google OAuth URL: `https://accounts.google.com/o/oauth2/v2/auth?client_id=...&response_type=code&scope=openid%20email%20profile`.
3. Google returns user to `/auth/google/callback?code=<AUTH_CODE>`.
4. Client page `GoogleCallback.jsx` sends code to backend `POST /api/auth/google`.
5. Backend exchanges code at `https://oauth2.googleapis.com/token` for an access token, fetches profile from `https://www.googleapis.com/oauth2/v2/userinfo`.
6. Backend auto-creates user in `users` table, signs a 7-day secure JWT token, and returns merchant session to frontend `localStorage`.

---

## 3. Meta / WhatsApp Cloud API Integration (How We Did Meta Part)

### 3.1 Credentials & IDs
* **Meta App ID**: `2872862256446175`
* **Meta App Secret**: `4b30fa94b657f4cba6972bde726db072`
* **WABA ID**: `1311505681068950`
* **Phone Number ID**: `1225478070642817`
* **Webhook Verify Token**: `8ee267f5fa1739ed50b9ed91a15ffd22c19b25bef2586f2d737534563c6831cd`
* **Graph API Version**: `v25.0`

### 3.2 24-Hour Policy & The Utility Template Solution
* **The 24h Window Rule**: Meta forbids sending freeform session text messages unless the customer initiated a conversation within the last 24 hours (`conv.last_inbound_at`).
* **The Utility Template (`order`)**:
  * Category: **`UTILITY`**
  * Status: **`APPROVED`**
  * Why it matters: Unlike Marketing templates (which have frequency caps), Utility templates are **EXEMPT from 24h customer care restrictions** and frequency limits. They guarantee 100% instant delivery to recipient phones at all times!

---

## 4. Shopify Integration (How We Did Shopify Part)

### 4.1 Storefront Widget & "Order on WhatsApp" Button
* **Dynamic Script Endpoint**: `GET https://arco-backend-ecbl.onrender.com/api/storefront/widget.js?shop=<SHOP>`
* **Features**:
  * Injects a floating WhatsApp chat button with custom brand color and "Replies in minutes" badge.
  * Injects a prominent green **"Order on WhatsApp"** button directly on Shopify product pages.
  * Clicking the button opens WhatsApp with pre-filled product title and price for instant customer inquiries.

### 4.2 Webhook Signature Security
Shopify signs webhooks with HMAC-SHA256 headers (`x-shopify-hmac-sha256`). ARCO's middleware (`shopifyWebhookVerify.js`) supports multiple candidate secrets:
1. `config.shopifyApiSecret` (`shpss_c5187d...`)
2. Store Notification Webhook Secret (`284205520fc82e75cbc0227df75798fcced8a8f036be76d8baf666bde486b43e`)

### 4.3 The 4 Automation Pillars
1. **Abandoned Cart Drip**: Recovers checkouts using 15m, 1h, and 24h drips with discount coupon `SAVE10` and 1-click cart recovery link.
2. **Order Confirmation**: Sends instant WhatsApp receipt upon `orders/create`.
3. **Cash on Delivery (COD) Anti-RTO**: Interactive WhatsApp confirmation buttons ("Reply 1 to Confirm, 2 to Cancel"), auto-tagging Shopify orders with `COD-Confirmed` or `COD-Cancelled`.
4. **Shipping & Courier Tracking**: Dispatches carrier name and tracking URL upon fulfillment.

### 4.4 Team Inbox Shopify Commerce Drawer
In `/inbox`, selecting any chat opens the real-time Shopify Commerce drawer:
* **Customer KPIs**: Lifetime spend (LTV), order count, AOV, returning customer tier.
* **Active Abandoned Cart**: Cart items, total price, 1-click **"⚡ Send Recovery"** and **"💬 Draft in Chat"**.
* **Order History**: Order numbers, financial/fulfillment badges, 1-click **"🚚 Tracking"** and **"🛡️ Verify COD"**.

---

## 5. Testing & Verification Guide

### 5.1 Simulator Script
Run custom tests from terminal with:
```powershell
# Simulate Abandoned Cart
node server/scripts/simulateShopifyCartAndOrder.mjs --action=abandon_cart --phone=9920858396 --name="Nilesh Patel" --product="Snowboard Liquid" --price=749

# Simulate COD Order
node server/scripts/simulateShopifyCartAndOrder.mjs --action=place_order --phone=9920858396 --name="Nilesh Patel" --order=1010 --price=1499 --payment=COD
```

### 5.2 Real Storefront Manual Testing
1. Visit storefront: `https://arco-test-e2a1thrd.myshopify.com/collections/all`
2. Add in-stock product to cart (e.g. *The Collection Snowboard: Hydrogen*).
3. Proceed to checkout -> enter email, US address, and mobile phone (`+91...`).
4. Click **"Continue to shipping"** and close tab.
5. View abandoned cart under **Shopify Admin -> Orders -> Abandoned checkouts** and **ARCO Team Inbox**!

---

## 6. Official Word Document (.docx)
The complete Word document with styled executive tables, callouts, and code blocks has been generated and saved to:
👉 `c:\Users\Shraddha\Desktop\saas-website\ARCO_Full_Documentation.docx`
