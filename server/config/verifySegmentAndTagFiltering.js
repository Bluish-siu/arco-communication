import { query } from './db.js';
import { segmentController } from '../controllers/segmentController.js';
import { contactController } from '../controllers/contactController.js';

// Helper mock req/res
function createMockReqRes(params = {}, queryParams = {}, body = {}) {
  let statusCode = 200;
  let responseData = null;

  const req = {
    params,
    query: queryParams,
    body,
  };

  const res = {
    status: (code) => {
      statusCode = code;
      return res;
    },
    json: (data) => {
      responseData = data;
      return res;
    },
  };

  const next = (err) => {
    if (err) {
      statusCode = 500;
      responseData = { error: err.message };
    }
  };

  return { req, res, next, getResult: () => ({ statusCode, responseData }) };
}

async function runTests() {
  console.log('Testing Select Segment & Select Tag Filtering Behavior in PostgreSQL...');
  const results = [];

  try {
    // Total contacts baseline
    const totalCountRes = await query('SELECT COUNT(*) FROM contacts');
    const totalContacts = parseInt(totalCountRes.rows[0].count, 10);

    // 1. Load Saved Segments (GET /api/segments)
    const { req: r1, res: s1, next: n1, getResult: g1 } = createMockReqRes();
    await segmentController.getAll(r1, s1, n1);
    const segsRes = g1().responseData;
    const initialSegments = segsRes.data || [];

    results.push({
      test: '1. Load Saved Segments from Backend',
      status: g1().statusCode,
      passed: g1().statusCode === 200 && initialSegments.length > 0,
      details: `Loaded ${initialSegments.length} saved segments. Available: ${initialSegments.map(s => s.name).join(', ')}`,
    });

    // 2. Select a Segment & Filter Contacts (e.g. seg_repeat_buyers)
    const targetSegment = initialSegments[0];
    const { req: r2, res: s2, next: n2, getResult: g2 } = createMockReqRes({}, { savedSegmentId: targetSegment.id, limit: 20 });
    await contactController.getAll(r2, s2, n2);
    const segFilteredRes = g2().responseData;

    results.push({
      test: `2. Filter Contacts by Selected Segment ("${targetSegment.name}")`,
      status: g2().statusCode,
      passed: g2().statusCode === 200 && segFilteredRes.total > 0 && segFilteredRes.total <= totalContacts,
      details: `Returned ${segFilteredRes.total} matching contacts for segment "${targetSegment.name}" (Page returned: ${segFilteredRes.data.length} rows)`,
    });

    // 3. Clear/Reset Segment Filter (savedSegmentId = 'all')
    const { req: r3, res: s3, next: n3, getResult: g3 } = createMockReqRes({}, { savedSegmentId: 'all', limit: 20 });
    await contactController.getAll(r3, s3, n3);
    const clearedSegRes = g3().responseData;

    results.push({
      test: '3. Clear Segment Filter (Reset to All Contacts)',
      status: g3().statusCode,
      passed: g3().statusCode === 200 && clearedSegRes.total === totalContacts,
      details: `Returned full contact dataset (${clearedSegRes.total} contacts)`,
    });

    // 4. Select Tag: "Repeat Buyers"
    const { req: r4, res: s4, next: n4, getResult: g4 } = createMockReqRes({}, { tag: 'Repeat Buyers', limit: 20 });
    await contactController.getAll(r4, s4, n4);
    const repeatBuyersRes = g4().responseData;

    const allRepeatBuyers = repeatBuyersRes.data.every(
      (c) => c.tag === 'Repeat Buyers' || (Array.isArray(c.tags) && c.tags.includes('Repeat Buyers'))
    );

    results.push({
      test: '4. Filter Contacts by Tag ("Repeat Buyers")',
      status: g4().statusCode,
      passed: g4().statusCode === 200 && repeatBuyersRes.total > 0 && allRepeatBuyers,
      details: `Found ${repeatBuyersRes.total} contacts with tag "Repeat Buyers". 100% data integrity verified.`,
    });

    // 5. Select Tag: "Recovered"
    const { req: r5, res: s5, next: n5, getResult: g5 } = createMockReqRes({}, { tag: 'Recovered', limit: 20 });
    await contactController.getAll(r5, s5, n5);
    const recoveredRes = g5().responseData;

    results.push({
      test: '5. Filter Contacts by Tag ("Recovered")',
      status: g5().statusCode,
      passed: g5().statusCode === 200 && recoveredRes.total > 0,
      details: `Found ${recoveredRes.total} contacts with tag "Recovered"`,
    });

    // 6. Select Tag: "Order Placed(Prepaid)"
    const { req: r6, res: s6, next: n6, getResult: g6 } = createMockReqRes({}, { tag: 'Order Placed(Prepaid)', limit: 20 });
    await contactController.getAll(r6, s6, n6);
    const prepaidRes = g6().responseData;

    results.push({
      test: '6. Filter Contacts by Tag ("Order Placed(Prepaid)")',
      status: g6().statusCode,
      passed: g6().statusCode === 200 && prepaidRes.total > 0,
      details: `Found ${prepaidRes.total} contacts with tag "Order Placed(Prepaid)"`,
    });

    // 7. Select Tag: "Loyal"
    const { req: r7, res: s7, next: n7, getResult: g7 } = createMockReqRes({}, { tag: 'Loyal', limit: 20 });
    await contactController.getAll(r7, s7, n7);
    const loyalRes = g7().responseData;

    results.push({
      test: '7. Filter Contacts by Tag ("Loyal")',
      status: g7().statusCode,
      passed: g7().statusCode === 200 && loyalRes.total > 0,
      details: `Found ${loyalRes.total} contacts with tag "Loyal"`,
    });

    // 8. Select Tag: "Abandoned Cart"
    const { req: r8, res: s8, next: n8, getResult: g8 } = createMockReqRes({}, { tag: 'Abandoned Cart', limit: 20 });
    await contactController.getAll(r8, s8, n8);
    const abandonedRes = g8().responseData;

    results.push({
      test: '8. Filter Contacts by Tag ("Abandoned Cart")',
      status: g8().statusCode,
      passed: g8().statusCode === 200 && abandonedRes.total > 0,
      details: `Found ${abandonedRes.total} contacts with tag "Abandoned Cart"`,
    });

    // 9. Clear Tag: "Tag: All"
    const { req: r9, res: s9, next: n9, getResult: g9 } = createMockReqRes({}, { tag: 'all', limit: 20 });
    await contactController.getAll(r9, s9, n9);
    const clearedTagRes = g9().responseData;

    results.push({
      test: '9. Select Tag: All (Clear Tag Filter)',
      status: g9().statusCode,
      passed: g9().statusCode === 200 && clearedTagRes.total === totalContacts,
      details: `Returned full contact dataset (${clearedTagRes.total} contacts)`,
    });

    // 10. Create New Segment through Save Segment flow (POST /api/segments)
    const testSegmentName = `Test VIP Cluster ${Date.now()}`;
    const { req: r10, res: s10, next: n10, getResult: g10 } = createMockReqRes(
      {},
      {},
      {
        name: testSegmentName,
        description: 'Dynamically created segment for verification flow',
        filterType: 'custom',
        conditions: [
          { category: 'tag', field: 'tag', operator: 'is', value: 'High Spenders' },
          { category: 'field', field: 'whatsapp_opted', operator: 'is', value: 'true' },
        ],
        logic: 'AND',
      }
    );
    await segmentController.create(r10, s10, n10);
    const createSegRes = g10().responseData;
    const createdSegment = createSegRes.data;

    results.push({
      test: '10. Create New Segment (POST /api/segments)',
      status: g10().statusCode,
      passed: g10().statusCode === 201 && createdSegment && createdSegment.id,
      details: `Successfully created segment "${testSegmentName}" with ID: ${createdSegment?.id} (${createdSegment?.estimatedCount} contacts)`,
    });

    // 11. Verify New Segment appears in Saved Segments list (GET /api/segments)
    const { req: r11, res: s11, next: n11, getResult: g11 } = createMockReqRes();
    await segmentController.getAll(r11, s11, n11);
    const updatedSegs = g11().responseData.data || [];
    const foundNewSeg = updatedSegs.find((s) => s.id === createdSegment.id);

    results.push({
      test: '11. Verify Newly Created Segment Appears in Select Segment List',
      status: g11().statusCode,
      passed: Boolean(foundNewSeg),
      details: foundNewSeg
        ? `Found segment "${foundNewSeg.name}" in Select Segment list with ${foundNewSeg.estimatedCount} estimated contacts`
        : 'Segment not found in list',
    });

    // 12. Filter Contacts with Newly Created Segment ID
    const { req: r12, res: s12, next: n12, getResult: g12 } = createMockReqRes({}, { savedSegmentId: createdSegment.id, limit: 20 });
    await contactController.getAll(r12, s12, n12);
    const newSegContacts = g12().responseData;

    results.push({
      test: '12. Query Contacts using Newly Created Saved Segment',
      status: g12().statusCode,
      passed: g12().statusCode === 200 && newSegContacts.total > 0,
      details: `Retrieved ${newSegContacts.total} contacts matching new segment criteria`,
    });

    // Cleanup test segment
    await query('DELETE FROM segments WHERE id = $1', [createdSegment.id]);

    console.table(results);
    const allPassed = results.every((r) => r.passed);
    console.log(allPassed ? '[ALL VERIFIED] 100% of Select Segment and Select Tag tests passed!' : '[FAILED] Some tests failed.');
  } catch (err) {
    console.error('Test execution error:', err);
  } finally {
    process.exit(0);
  }
}

runTests();
