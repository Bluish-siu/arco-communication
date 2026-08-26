async function verifyCommerceSettingsFlow() {
  const BASE_URL = 'http://localhost:5000/api';
  const results = [];

  console.log('Testing ARCO WhatsApp Commerce -> Commerce Settings Flow...');

  // 1. Get Commerce Settings (GET /api/commerce/settings)
  try {
    const res = await fetch(`${BASE_URL}/commerce/settings`);
    const json = await res.json();
    const data = json.data;

    const hasSettings = data && data.messageSettings && data.productCount !== undefined;
    const passed = res.status === 200 && hasSettings;

    results.push({
      test: '1. Load Commerce Settings (GET /api/commerce/settings)',
      status: res.status,
      passed,
      details: `Loaded settings for catalog: "${data?.catalogName || 'N/A'}" (Status: ${data?.catalogStatus}, Products: ${data?.productCount})`,
    });
  } catch (e) {
    results.push({ test: '1. Load Commerce Settings', status: 'ERROR', passed: false, details: e.message });
  }

  // 2. Connect Facebook Catalog ID (POST /api/commerce/catalog/connect)
  try {
    const res = await fetch(`${BASE_URL}/commerce/catalog/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        catalogId: 'cat_9082410291',
        catalogName: 'ARCO Official Storefront Catalog',
      }),
    });
    const json = await res.json();
    const passed = res.status === 200 && json.data?.catalogConnected === true && json.data?.catalogId === 'cat_9082410291';

    results.push({
      test: '2. Connect Facebook Catalog ID (POST /api/commerce/catalog/connect)',
      status: res.status,
      passed,
      details: `Successfully connected Catalog ID: "${json.data?.catalogId}" (Status: ${json.data?.catalogStatus})`,
    });
  } catch (e) {
    results.push({ test: '2. Connect Catalog', status: 'ERROR', passed: false, details: e.message });
  }

  // 3. Upload Product CSV (POST /api/commerce/catalog/upload-csv)
  try {
    const sampleCsv = `id,title,description,price,availability,image_link,brand
SKU_DEMO_01,ARCO Aura Wireless Earbuds,Compact Bluetooth 5.3 earbuds with ENC microphones,2999.00,in stock,https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600,ARCO Audio
SKU_DEMO_02,ARCO Smart Fitness Band V2,Activity and heart rate tracker with 14-day battery,1999.00,in stock,https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600,ARCO Wearables
SKU_DEMO_03,ARCO Minimalist Leather Wallet,Slim RFID blocking genuine leather card holder,1250.00,in stock,https://images.unsplash.com/photo-1627123424574-724758594e93?w=600,ARCO Leather`;

    const res = await fetch(`${BASE_URL}/commerce/catalog/upload-csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvContent: sampleCsv }),
    });
    const json = await res.json();
    const passed = res.status === 200 && json.data?.imported >= 0;

    results.push({
      test: '3. Upload Product CSV (POST /api/commerce/catalog/upload-csv)',
      status: res.status,
      passed,
      details: `Processed CSV products (Imported/Updated: ${json.data?.imported + json.data?.updated}, Total in DB: ${json.data?.total})`,
    });
  } catch (e) {
    results.push({ test: '3. Upload Product CSV', status: 'ERROR', passed: false, details: e.message });
  }

  // 4. Retrieve Catalog Products (GET /api/commerce/products)
  try {
    const res = await fetch(`${BASE_URL}/commerce/products`);
    const json = await res.json();
    const products = json.data;
    const passed = res.status === 200 && Array.isArray(products) && products.length > 0;

    results.push({
      test: '4. Retrieve Catalog Products (GET /api/commerce/products)',
      status: res.status,
      passed,
      details: `Retrieved ${products?.length} active products from PostgreSQL (Top product: "${products[0]?.title}" - ₹${products[0]?.price})`,
    });
  } catch (e) {
    results.push({ test: '4. Retrieve Products', status: 'ERROR', passed: false, details: e.message });
  }

  // 5. Update Commerce Configuration (PUT /api/commerce/settings)
  try {
    const res = await fetch(`${BASE_URL}/commerce/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messageSettings: {
          title: 'Special Summer Catalog 2026',
          body: 'Discover our newest summer collection with exclusive 20% discount on WhatsApp checkout.',
          cta: 'Shop Now',
          enabled: true,
        },
        autoReplySettings: {
          keywords: ['catalog', 'menu', 'store', 'shop', 'order'],
          replyText: 'Welcome to our store! Tap below to browse all collections and order directly on WhatsApp.',
          enabled: true,
        },
        autocheckoutSettings: {
          enabled: true,
          paymentMode: 'cod_and_upi',
          orderConfirmationMsg: 'Order placed! We will dispatch your items today.',
        },
      }),
    });
    const json = await res.json();
    const passed = res.status === 200 && json.success === true;

    results.push({
      test: '5. Update Commerce Settings (PUT /api/commerce/settings)',
      status: res.status,
      passed,
      details: 'Successfully saved Message, Auto-Reply, and Autocheckout configurations in PostgreSQL',
    });
  } catch (e) {
    results.push({ test: '5. Update Settings', status: 'ERROR', passed: false, details: e.message });
  }

  // 6. Verify Persisted Settings (GET /api/commerce/settings)
  try {
    const res = await fetch(`${BASE_URL}/commerce/settings`);
    const json = await res.json();
    const data = json.data;
    const isPersisted = data?.messageSettings?.title === 'Special Summer Catalog 2026';
    const passed = res.status === 200 && isPersisted;

    results.push({
      test: '6. Verify Persistence in PostgreSQL',
      status: res.status,
      passed,
      details: `Confirmed message settings title: "${data?.messageSettings?.title}" (100% Persisted)`,
    });
  } catch (e) {
    results.push({ test: '6. Verify Persistence', status: 'ERROR', passed: false, details: e.message });
  }

  console.table(results);
  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of WhatsApp Commerce Settings tests passed!');
  } else {
    console.error('[FAILURES DETECTED]');
  }
}

verifyCommerceSettingsFlow();
