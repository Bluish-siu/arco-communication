async function verifyCheckoutBotFlow() {
  const BASE_URL = 'http://localhost:5000/api';
  const results = [];

  console.log('Testing ARCO WhatsApp Commerce -> Checkout Bot & State Machine Flow...');

  // 1. Get Workflow Definition
  try {
    const res = await fetch(`${BASE_URL}/checkout-bot`);
    const json = await res.json();
    const data = json.data;
    const passed = res.status === 200 && data && !!data.cartConfirmationMsg;

    results.push({
      test: '1. Load Workflow Definition (GET /api/checkout-bot)',
      status: res.status,
      passed,
      details: `Loaded workflow "${data?.name}" (Status: ${data?.status}, Steps: ${data?.stepCount})`,
    });
  } catch (e) {
    results.push({ test: '1. Load Workflow', status: 'ERROR', passed: false, details: e.message });
  }

  // 2. Get Status & Remaining Steps
  try {
    const res = await fetch(`${BASE_URL}/checkout-bot/status`);
    const json = await res.json();
    const data = json.data;
    const passed = res.status === 200 && data.remainingSteps !== undefined && data.catalogConnected !== undefined;

    results.push({
      test: '2. Check Workflow Status & Steps (GET /api/checkout-bot/status)',
      status: res.status,
      passed,
      details: `Catalog Connected: ${data.catalogConnected} ("${data.catalogId}"), Steps Remaining: ${data.remainingSteps}/${data.totalSteps}, Completed Orders: ${data.stats?.completedOrders}`,
    });
  } catch (e) {
    results.push({ test: '2. Check Status', status: 'ERROR', passed: false, details: e.message });
  }

  // 3. Update Workflow Configuration
  try {
    const res = await fetch(`${BASE_URL}/checkout-bot`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shippingConfig: {
          freeShippingThreshold: 1000,
          defaultShippingCharge: 50,
          discountType: 'percentage',
          discountValue: 10,
        },
      }),
    });
    const json = await res.json();
    const passed = res.status === 200 && json.success === true;

    results.push({
      test: '3. Update Workflow Configuration (PUT /api/checkout-bot)',
      status: res.status,
      passed,
      details: 'Successfully saved shipping threshold and discount rules in PostgreSQL',
    });
  } catch (e) {
    results.push({ test: '3. Update Workflow', status: 'ERROR', passed: false, details: e.message });
  }

  // 4. Publish Workflow (Set Live)
  try {
    const res = await fetch(`${BASE_URL}/checkout-bot/publish`, {
      method: 'POST',
    });
    const json = await res.json();
    const passed = res.status === 200 && json.data?.status === 'live';

    results.push({
      test: '4. Publish Workflow (POST /api/checkout-bot/publish)',
      status: res.status,
      passed,
      details: `Workflow published: status is now "${json.data?.status}"`,
    });
  } catch (e) {
    results.push({ test: '4. Publish Workflow', status: 'ERROR', passed: false, details: e.message });
  }

  // 5. Test State Machine Step 1: START Session
  let sessionId = null;
  try {
    const res = await fetch(`${BASE_URL}/checkout-bot/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'START' }),
    });
    const json = await res.json();
    sessionId = json.data?.sessionId;
    const passed = res.status === 200 && json.data?.currentState === 'WAITING_CART_CONFIRMATION';

    results.push({
      test: '5. State Machine: START Session',
      status: res.status,
      passed,
      details: `Session "${sessionId}" initiated. Current State: "${json.data?.currentState}"`,
    });
  } catch (e) {
    results.push({ test: '5. START Session', status: 'ERROR', passed: false, details: e.message });
  }

  // 6. Test State Machine Step 2: Customer replies "Yes"
  try {
    const res = await fetch(`${BASE_URL}/checkout-bot/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'RESPOND',
        sessionId,
        customerInput: 'Yes',
      }),
    });
    const json = await res.json();
    const passed = res.status === 200 && json.data?.currentState === 'COLLECTING_NAME';

    results.push({
      test: '6. State Machine: YES -> COLLECTING_NAME',
      status: res.status,
      passed,
      details: `State advanced to "${json.data?.currentState}". Bot Prompt: "${json.data?.botReply}"`,
    });
  } catch (e) {
    results.push({ test: '6. YES Branch', status: 'ERROR', passed: false, details: e.message });
  }

  // 7. Test State Machine Step 3: Customer provides Name
  try {
    const res = await fetch(`${BASE_URL}/checkout-bot/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'RESPOND',
        sessionId,
        customerInput: 'Aarav Sharma',
      }),
    });
    const json = await res.json();
    const passed = res.status === 200 && json.data?.currentState === 'COLLECTING_PINCODE';

    results.push({
      test: '7. State Machine: Name -> COLLECTING_PINCODE',
      status: res.status,
      passed,
      details: `Name recorded as "${json.data?.collectedData?.customer_name}". State: "${json.data?.currentState}"`,
    });
  } catch (e) {
    results.push({ test: '7. Name Collection', status: 'ERROR', passed: false, details: e.message });
  }

  // 8. Test State Machine Step 4: Customer provides Pincode
  try {
    const res = await fetch(`${BASE_URL}/checkout-bot/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'RESPOND',
        sessionId,
        customerInput: '560001',
      }),
    });
    const json = await res.json();
    const passed = res.status === 200 && json.data?.currentState === 'COLLECTING_ADDRESS' && json.data?.collectedData?.city === 'Bengaluru';

    results.push({
      test: '8. State Machine: Pincode -> Auto-Resolve Location',
      status: res.status,
      passed,
      details: `Resolved Pincode 560001 to "${json.data?.collectedData?.city}, ${json.data?.collectedData?.state}". State: "${json.data?.currentState}"`,
    });
  } catch (e) {
    results.push({ test: '8. Pincode Resolution', status: 'ERROR', passed: false, details: e.message });
  }

  // 9. Test State Machine Step 5: Customer provides Street Address
  try {
    const res = await fetch(`${BASE_URL}/checkout-bot/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'RESPOND',
        sessionId,
        customerInput: 'Flat 402, Prestige Towers, MG Road',
      }),
    });
    const json = await res.json();
    const passed = res.status === 200 && json.data?.currentState === 'CONFIRMING_ORDER';

    results.push({
      test: '9. State Machine: Address -> CONFIRMING_ORDER',
      status: res.status,
      passed,
      details: `Address saved. Bot prompt ready with options: [${json.data?.options?.join(', ')}]`,
    });
  } catch (e) {
    results.push({ test: '9. Address Collection', status: 'ERROR', passed: false, details: e.message });
  }

  // 10. Test State Machine Step 6: Order Confirmation & Creation
  let createdOrderNumber = null;
  try {
    const res = await fetch(`${BASE_URL}/checkout-bot/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'RESPOND',
        sessionId,
        customerInput: 'Yes',
      }),
    });
    const json = await res.json();
    createdOrderNumber = json.data?.orderCreated?.order_number;
    const passed = res.status === 200 && json.data?.currentState === 'ORDER_PLACED' && !!createdOrderNumber;

    results.push({
      test: '10. State Machine: Confirm -> ORDER_PLACED & DB Insert',
      status: res.status,
      passed,
      details: `Order created: "${createdOrderNumber}" for ₹${json.data?.orderCreated?.total_amount}. State: "${json.data?.currentState}"`,
    });
  } catch (e) {
    results.push({ test: '10. Order Placement', status: 'ERROR', passed: false, details: e.message });
  }

  // 11. Verify Order in GET /api/checkout-bot/orders
  try {
    const res = await fetch(`${BASE_URL}/checkout-bot/orders`);
    const json = await res.json();
    const orders = json.data || [];
    const found = orders.find((o) => o.order_number === createdOrderNumber);
    const passed = res.status === 200 && !!found;

    results.push({
      test: '11. Verify Order in PostgreSQL DB',
      status: res.status,
      passed,
      details: `Retrieved order #${found?.order_number} (${found?.customer_name} - ₹${found?.total_amount}, Payment: ${found?.payment_method})`,
    });
  } catch (e) {
    results.push({ test: '11. Verify Order', status: 'ERROR', passed: false, details: e.message });
  }

  console.table(results);
  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of WhatsApp Checkout Bot tests passed!');
  } else {
    console.error('[FAILURES DETECTED]');
  }
}

verifyCheckoutBotFlow();
