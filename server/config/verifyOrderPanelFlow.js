async function verifyOrderPanelFlow() {
  const BASE_URL = 'http://localhost:5000/api';
  const results = [];

  console.log('Testing ARCO WhatsApp Commerce -> Order Panel & PostgreSQL Flow...');

  // 1. Get Orders List (GET /api/commerce/orders)
  let orderList = [];
  try {
    const res = await fetch(`${BASE_URL}/commerce/orders?page=1&limit=20`);
    const json = await res.json();
    orderList = json.orders || [];
    const passed = res.status === 200 && Array.isArray(orderList) && json.pagination?.total !== undefined;

    results.push({
      test: '1. Load Orders List (GET /api/commerce/orders)',
      status: res.status,
      passed,
      details: `Retrieved ${orderList.length} orders (Total in DB: ${json.pagination?.total}, Total Pages: ${json.pagination?.totalPages})`,
    });
  } catch (e) {
    results.push({ test: '1. Load Orders', status: 'ERROR', passed: false, details: e.message });
  }

  // 2. Fetch Single Order Details (GET /api/commerce/orders/:orderId)
  const targetOrder = orderList[0];
  if (targetOrder) {
    try {
      const res = await fetch(`${BASE_URL}/commerce/orders/${targetOrder.id}`);
      const json = await res.json();
      const passed = res.status === 200 && json.data?.order_number === targetOrder.order_number;

      results.push({
        test: '2. Get Single Order Details (GET /api/commerce/orders/:id)',
        status: res.status,
        passed,
        details: `Loaded details for order #${json.data?.order_number} (${json.data?.customer_name} - ₹${json.data?.total_amount})`,
      });
    } catch (e) {
      results.push({ test: '2. Get Single Order', status: 'ERROR', passed: false, details: e.message });
    }
  }

  // 3. Update Order Status (PATCH /api/commerce/orders/:orderId/status)
  if (targetOrder) {
    try {
      const res = await fetch(`${BASE_URL}/commerce/orders/${targetOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderStatus: 'Shipped',
          fulfillmentStatus: 'Shipped',
        }),
      });
      const json = await res.json();
      const passed = res.status === 200 && json.data?.order_status === 'Shipped';

      results.push({
        test: '3. Update Order Status (PATCH /api/commerce/orders/:id/status)',
        status: res.status,
        passed,
        details: `Updated order #${targetOrder.order_number} status to "${json.data?.order_status}" & fulfillment to "${json.data?.fulfillment_status}"`,
      });
    } catch (e) {
      results.push({ test: '3. Update Status', status: 'ERROR', passed: false, details: e.message });
    }
  }

  // 4. Export CSV (GET /api/commerce/orders/export)
  try {
    const res = await fetch(`${BASE_URL}/commerce/orders/export`);
    const text = await res.text();
    const isCsv = res.status === 200 && text.includes('Order ID,Customer Name');

    results.push({
      test: '4. Export Orders CSV (GET /api/commerce/orders/export)',
      status: res.status,
      passed: isCsv,
      details: `Generated CSV export containing ${text.split('\n').length - 1} order records with full columns`,
    });
  } catch (e) {
    results.push({ test: '4. Export CSV', status: 'ERROR', passed: false, details: e.message });
  }

  // 5. Get Webhook Config (GET /api/commerce/orders/webhooks)
  try {
    const res = await fetch(`${BASE_URL}/commerce/orders/webhooks`);
    const json = await res.json();
    const passed = res.status === 200 && !!json.data?.webhookUrl && !!json.data?.secretKey;

    results.push({
      test: '5. Webhook Configuration (GET /api/commerce/orders/webhooks)',
      status: res.status,
      passed,
      details: `Retrieved webhook endpoint: "${json.data?.webhookUrl}" with signing secret`,
    });
  } catch (e) {
    results.push({ test: '5. Webhook Config', status: 'ERROR', passed: false, details: e.message });
  }

  // 6. Regenerate Webhook Secret (POST /api/commerce/orders/webhooks/regenerate)
  try {
    const res = await fetch(`${BASE_URL}/commerce/orders/webhooks/regenerate`, {
      method: 'POST',
    });
    const json = await res.json();
    const passed = res.status === 200 && !!json.data?.secretKey;

    results.push({
      test: '6. Regenerate Webhook Secret (POST /api/commerce/orders/webhooks/regenerate)',
      status: res.status,
      passed,
      details: 'Successfully generated fresh HMAC signing secret in PostgreSQL',
    });
  } catch (e) {
    results.push({ test: '6. Regenerate Secret', status: 'ERROR', passed: false, details: e.message });
  }

  // 7. Filter Test: Order Status = Shipped
  try {
    const res = await fetch(`${BASE_URL}/commerce/orders?orderStatus=Shipped`);
    const json = await res.json();
    const passed = res.status === 200 && json.orders?.every((o) => o.order_status.toLowerCase() === 'shipped');

    results.push({
      test: '7. Filter by Order Status ("Shipped")',
      status: res.status,
      passed,
      details: `Filtered dataset returned ${json.orders?.length} orders strictly in "Shipped" status`,
    });
  } catch (e) {
    results.push({ test: '7. Filter Test', status: 'ERROR', passed: false, details: e.message });
  }

  // 8. Search Test: search="Nilesh"
  try {
    const res = await fetch(`${BASE_URL}/commerce/orders?search=Nilesh`);
    const json = await res.json();
    const passed = res.status === 200 && json.orders?.some((o) => o.customer_name?.includes('Nilesh'));

    results.push({
      test: '8. Search Orders (search="Nilesh")',
      status: res.status,
      passed,
      details: `Found ${json.orders?.length} orders matching search query "Nilesh"`,
    });
  } catch (e) {
    results.push({ test: '8. Search Test', status: 'ERROR', passed: false, details: e.message });
  }

  console.table(results);
  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of WhatsApp Commerce Order Panel tests passed!');
  } else {
    console.error('[FAILURES DETECTED]');
  }
}

verifyOrderPanelFlow();
