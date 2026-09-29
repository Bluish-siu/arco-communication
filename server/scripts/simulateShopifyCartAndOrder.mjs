/**
 * ARCO Communication — Shopify Storefront & Cart Live Testing Simulator
 *
 * Use this script to test all Shopify product & cart workflows:
 * 1. Simulate adding a product to cart & abandoning checkout (Webhook & DB sync)
 * 2. Send instant real WhatsApp notification (Utility template guaranteed delivery)
 * 3. Simulate placing an order (COD anti-RTO or Prepaid)
 * 4. Verify updates appear in Team Inbox (https://arco-communication.vercel.app/inbox)
 *
 * Usage:
 *   node server/scripts/simulateShopifyCartAndOrder.mjs --action=abandon_cart --phone=8355866239 --name="Vicky Gupta" --product="Retro High-Top Suede Sneakers" --price=2499
 *   node server/scripts/simulateShopifyCartAndOrder.mjs --action=place_order --phone=9920858396 --name="Nilesh Patel" --order=1008 --price=1899 --payment=COD
 *   node server/scripts/simulateShopifyCartAndOrder.mjs --action=send_recovery --phone=8355866239
 */

import { query, pool } from '../config/db.js';
import { shopifyAutomationService } from '../services/shopifyAutomationService.js';
import { metaWhatsAppService, formatPhoneNumber } from '../services/metaWhatsAppService.js';

// Parse command line arguments
const args = process.argv.slice(2);
function getArg(name, defaultValue = null) {
  const match = args.find((a) => a.startsWith(`--${name}=`));
  if (match) return match.split('=')[1];
  return defaultValue;
}

const action = getArg('action', 'abandon_cart'); // 'abandon_cart' | 'place_order' | 'send_recovery' | 'status'
const inputPhone = getArg('phone', '8355866239');
const customerName = getArg('name', 'Vicky Gupta');
const productName = getArg('product', 'Retro High-Top Suede Sneakers');
const price = parseFloat(getArg('price', '2499'));
const orderNumber = getArg('order', '1008');
const paymentStatus = getArg('payment', 'COD'); // 'COD' | 'Paid'

const cleanPhone = formatPhoneNumber(inputPhone);
const shopDomain = 'arco-test-e2a1thrd.myshopify.com';

console.log('=============================================================');
console.log('  🛍️ ARCO SHOPIFY PRODUCT & CART SIMULATOR');
console.log('=============================================================');
console.log(`Action          : ${action}`);
console.log(`Recipient Phone : ${cleanPhone} (${customerName})`);
console.log(`Store Domain    : ${shopDomain}`);
console.log(`Product Name    : ${productName} (₹${price})`);
console.log('=============================================================\n');

async function runSimulation() {
  try {
    // Resolve user_id from connected integration
    const integRes = await query("SELECT user_id FROM shopify_integrations WHERE status = 'connected' LIMIT 1");
    const userId = integRes.rows[0]?.user_id || 'usr_shopify_1790591271259';

    if (action === 'abandon_cart') {
      console.log('📦 Step 1: Simulating shopper adding item to cart and leaving checkout...');
      const checkoutId = `chk_test_${Date.now()}`;
      const checkoutToken = `tok_${Date.now()}`;
      const recoveryUrl = `https://${shopDomain}/checkouts/cn/${checkoutToken}`;

      const checkoutPayload = {
        id: checkoutId,
        token: checkoutToken,
        email: 'shopper@test.com',
        phone: cleanPhone,
        total_price: price.toFixed(2),
        subtotal_price: price.toFixed(2),
        currency: 'INR',
        abandoned_checkout_url: recoveryUrl,
        customer: {
          first_name: customerName.split(' ')[0] || 'Valued',
          last_name: customerName.split(' ')[1] || 'Customer',
          phone: cleanPhone,
          email: 'shopper@test.com'
        },
        shipping_address: {
          first_name: customerName.split(' ')[0] || 'Valued',
          last_name: customerName.split(' ')[1] || 'Customer',
          phone: cleanPhone,
          city: 'Mumbai',
          province: 'Maharashtra',
          country: 'India',
          zip: '400053'
        },
        line_items: [
          {
            id: `item_${Date.now()}`,
            title: productName,
            quantity: 1,
            price: price.toFixed(2),
            variant_title: 'Standard Edition'
          }
        ]
      };

      // Process via official automation engine
      const result = await shopifyAutomationService.handleCheckoutCreatedOrUpdated({
        shopDomain,
        checkout: checkoutPayload,
        topic: 'checkouts/create',
        userId,
      });

      console.log('✓ Abandoned Cart registered successfully in database!');
      console.log(`  Checkout ID : ${checkoutId}`);
      console.log(`  Recovery URL: ${recoveryUrl}`);
      console.log(`  Status      : abandoned`);

      // Optionally dispatch WhatsApp notification immediately
      const sendWa = getArg('send_wa', 'true') === 'true';
      if (sendWa) {
        console.log('\n📲 Step 2: Dispatching real WhatsApp Recovery notification via Meta Utility template...');
        const waRes = await metaWhatsAppService.sendTemplateMessage({
          to: cleanPhone,
          templateName: 'order', // Approved Utility template (100% 24h bypass)
          userId,
        });

        if (waRes.success) {
          console.log(`✓ WhatsApp message sent to ${cleanPhone}!`);
          console.log(`  WAMID: ${waRes.wamid || waRes.metaMessageId}`);
        } else {
          console.log(`⚠ WhatsApp dispatch notice: ${waRes.error || waRes.message}`);
        }
      }

      console.log('\n👀 View in ARCO Team Inbox:');
      console.log('  1. Open: https://arco-communication.vercel.app/inbox');
      console.log(`  2. Click conversation for ${customerName} (${cleanPhone})`);
      console.log('  3. Open right drawer -> [ 🛍️ Shopify ] tab to see the live Abandoned Cart card!');

    } else if (action === 'send_recovery') {
      console.log(`📲 Sending Abandoned Cart recovery WhatsApp to ${cleanPhone}...`);
      const waRes = await metaWhatsAppService.sendTemplateMessage({
        to: cleanPhone,
        templateName: 'order',
        userId,
      });
      console.log('WhatsApp Result:', waRes);

    } else if (action === 'place_order') {
      console.log(`📦 Simulating Order Placement (#${orderNumber}) with payment: ${paymentStatus}...`);
      const orderId = `ord_test_${Date.now()}`;

      // Insert into checkout_orders
      await query(
        `INSERT INTO checkout_orders (
           id, order_number, user_id, customer_name, customer_email, phone_number,
           items, subtotal, discount, tax, total_amount, payment_status,
           order_status, fulfillment_status, city, state, pincode, shipping_country, currency, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          orderId,
          orderNumber,
          userId,
          customerName,
          'shopper@test.com',
          cleanPhone,
          JSON.stringify([{ title: productName, quantity: 1, price }]),
          price,
          0,
          0,
          price,
          paymentStatus,
          paymentStatus === 'COD' ? 'Confirmed' : 'Paid',
          'Unfulfilled',
          'Mumbai',
          'Maharashtra',
          '400053',
          'India',
          'INR'
        ]
      );

      // Cancel any abandoned checkout for this phone
      await query(
        `UPDATE shopify_abandoned_checkouts
         SET status = 'completed', updated_at = CURRENT_TIMESTAMP
         WHERE phone = $1 OR phone = $2`,
        [cleanPhone, `+${cleanPhone}`]
      );

      console.log(`✓ Order #${orderNumber} placed successfully!`);
      console.log(`  Payment Status : ${paymentStatus}`);
      console.log(`  Order Amount   : ₹${price}`);
      console.log('  (Any active abandoned cart recovery for this shopper has been automatically marked completed)');

      // Dispatch Order Confirmation WhatsApp
      console.log('\n📲 Sending Order Confirmation WhatsApp notification...');
      const waRes = await metaWhatsAppService.sendTemplateMessage({
        to: cleanPhone,
        templateName: 'order',
        userId,
      });
      if (waRes.success) {
        console.log(`✓ Order Confirmation WhatsApp sent to ${cleanPhone}!`);
        console.log(`  WAMID: ${waRes.wamid || waRes.metaMessageId}`);
      }

    } else if (action === 'status') {
      const carts = await query('SELECT * FROM shopify_abandoned_checkouts ORDER BY created_at DESC LIMIT 3');
      const orders = await query('SELECT * FROM checkout_orders ORDER BY created_at DESC LIMIT 3');
      console.log('Abandoned Carts:', carts.rows);
      console.log('Orders:', orders.rows);
    } else if (action === 'cancel_pending' || action === 'cancel_all_pending') {
      console.log('🛑 Cancelling all pending delayed automation jobs (Do Not Disturb)...');
      const cancelRes = await query(
        `UPDATE delayed_automation_jobs
         SET status = 'cancelled',
             cancellation_reason = 'user_requested_dnd',
             cancelled_at = CURRENT_TIMESTAMP,
             updated_at = CURRENT_TIMESTAMP
         WHERE status = 'pending'
         RETURNING id, automation_type, contact_phone, scheduled_at`
      );
      console.log(`✓ Cancelled ${cancelRes.rowCount} pending jobs:`, cancelRes.rows);
    }
  } catch (err) {
    console.error('❌ Simulation Error:', err.message);
  } finally {
    await pool.end();
  }
}

runSimulation();
