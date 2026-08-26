async function verifyCommerceCatalogFlow() {
  const BASE_URL = 'http://localhost:5000/api';
  const results = [];

  console.log('Testing ARCO WhatsApp Commerce -> Catalog Suite & Synchronization Flow...');

  // 1. Get Initial Products
  let initialProducts = [];
  try {
    const res = await fetch(`${BASE_URL}/commerce/products`);
    const json = await res.json();
    initialProducts = json.data || [];
    const passed = res.status === 200 && Array.isArray(initialProducts);

    results.push({
      test: '1. Load Catalog Products (GET /api/commerce/products)',
      status: res.status,
      passed,
      details: `Loaded ${initialProducts.length} active products from PostgreSQL`,
    });
  } catch (e) {
    results.push({ test: '1. Load Catalog Products', status: 'ERROR', passed: false, details: e.message });
  }

  // 2. Upload Sample CSV to Catalog
  let createdProductId = null;
  try {
    const csvContent = `id,title,description,price,availability,image_link,brand
SKU_CAT_TEST_99,ARCO Pro Noise Cancelling Headset,Premium gaming & office studio headphones with mic,4999.00,in stock,https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600,ARCO Audio`;

    const res = await fetch(`${BASE_URL}/commerce/catalog/upload-csv`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvContent }),
    });
    const json = await res.json();
    const passed = res.status === 200 && json.success === true;

    results.push({
      test: '2. Upload CSV via Catalog Page (POST /api/commerce/catalog/upload-csv)',
      status: res.status,
      passed,
      details: `Imported product into catalog. Total in DB: ${json.data?.total}`,
    });
  } catch (e) {
    results.push({ test: '2. Upload CSV via Catalog', status: 'ERROR', passed: false, details: e.message });
  }

  // 3. Verify Product appears in GET /api/commerce/products
  try {
    const res = await fetch(`${BASE_URL}/commerce/products`);
    const json = await res.json();
    const prods = json.data || [];
    const found = prods.find((p) => p.external_product_id === 'SKU_CAT_TEST_99');
    if (found) createdProductId = found.id;
    const passed = res.status === 200 && !!found;

    results.push({
      test: '3. Verify Product in Catalog List',
      status: res.status,
      passed,
      details: `Found imported product: "${found?.title}" (Price: ₹${found?.price})`,
    });
  } catch (e) {
    results.push({ test: '3. Verify Product', status: 'ERROR', passed: false, details: e.message });
  }

  // 4. Verify Shared State with Commerce Settings (GET /api/commerce/settings)
  try {
    const res = await fetch(`${BASE_URL}/commerce/settings`);
    const json = await res.json();
    const data = json.data;
    const passed = res.status === 200 && data.productCount > 0 && data.catalogStatus === 'connected';

    results.push({
      test: '4. Shared State with Commerce Settings',
      status: res.status,
      passed,
      details: `Settings reports ${data.productCount} active products & Connected Catalog: "${data.catalogId}"`,
    });
  } catch (e) {
    results.push({ test: '4. Shared State', status: 'ERROR', passed: false, details: e.message });
  }

  // 5. Delete Product (DELETE /api/commerce/products/:id)
  if (createdProductId) {
    try {
      const res = await fetch(`${BASE_URL}/commerce/products/${createdProductId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      const passed = res.status === 200 && json.success === true;

      results.push({
        test: '5. Delete Product (DELETE /api/commerce/products/:id)',
        status: res.status,
        passed,
        details: `Successfully deleted product ID "${createdProductId}". Remaining in DB: ${json.data?.remainingCount}`,
      });
    } catch (e) {
      results.push({ test: '5. Delete Product', status: 'ERROR', passed: false, details: e.message });
    }
  }

  // 6. Verify Deletion Persisted
  if (createdProductId) {
    try {
      const res = await fetch(`${BASE_URL}/commerce/products`);
      const json = await res.json();
      const prods = json.data || [];
      const stillExists = prods.some((p) => p.id === createdProductId);
      const passed = res.status === 200 && !stillExists;

      results.push({
        test: '6. Confirm Deletion Persistence in PostgreSQL',
        status: res.status,
        passed,
        details: `Confirmed product "${createdProductId}" no longer exists in PostgreSQL`,
      });
    } catch (e) {
      results.push({ test: '6. Confirm Deletion', status: 'ERROR', passed: false, details: e.message });
    }
  }

  console.table(results);
  const allPassed = results.every((r) => r.passed);
  if (allPassed) {
    console.log('[ALL VERIFIED] 100% of WhatsApp Commerce Catalog tests passed!');
  } else {
    console.error('[FAILURES DETECTED]');
  }
}

verifyCommerceCatalogFlow();
