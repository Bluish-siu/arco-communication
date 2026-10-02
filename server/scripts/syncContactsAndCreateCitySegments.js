import { query } from '../config/db.js';
import { buildConditionClause } from '../controllers/contactController.js';

async function syncAndCreateSegments() {
  console.log('--- 1. Syncing 121 Optical Shops to Contacts Table ---');

  const rawRecipients = await query(`
    SELECT name, phone, campaign_id, csv_data 
    FROM campaign_recipients 
    WHERE campaign_id IN ('cmp_1790871237782', 'cmp_1790851009326')
    ORDER BY created_at ASC
  `);

  const demoLeads = ['9624000799', '9601979996', '9712128736'];
  const byPhone = new Map();

  for (const r of rawRecipients.rows) {
    const clean10 = String(r.phone).replace(/\D/g, '').slice(-10);
    if (!byPhone.has(clean10)) {
      byPhone.set(clean10, r);
    }
  }

  console.log(`Unique shops to sync: ${byPhone.size}`);

  let ahmedabadCount = 0;
  let gandhinagarCount = 0;
  let stage1Count = 0;

  for (const [clean10, r] of byPhone.entries()) {
    const cData = r.csv_data?.csvData || {};
    const bName = cData['Business Name'] || r.name || 'Valued Customer';
    const cityRaw = (cData['City'] || '').trim().toLowerCase();
    const isGandhinagar = cityRaw === 'gandhinagar' || r.campaign_id === 'cmp_1790871237782';
    const segmentName = isGandhinagar ? 'Gandhinagar' : 'Ahmedabad';
    const isDemoLead = demoLeads.includes(clean10);
    const tag = isDemoLead ? 'Stage 1' : 'Lead';
    const fullPhone = r.phone.startsWith('+') ? r.phone : `+91${clean10}`;

    if (isDemoLead) stage1Count++;
    if (isGandhinagar) gandhinagarCount++;
    else ahmedabadCount++;

    const contactId = `cnt_opt_${clean10}`;
    const customAttrs = {
      area: cData['Area'] || '',
      city: segmentName,
      address: cData['Address'] || '',
      pincode: cData['Pincode'] || '',
      rating: cData['Rating'] || '',
      placeId: cData['Place ID'] || '',
      source: 'optical_shops_campaign',
    };

    await query(
      `INSERT INTO contacts (
        id, name, phone, tag, tags, segment, status, owner, channel,
        whatsapp_opted, custom_attributes, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 'Open Lead', 'Shraddha', 'whatsapp',
        true, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        tag = EXCLUDED.tag,
        tags = EXCLUDED.tags,
        segment = EXCLUDED.segment,
        whatsapp_opted = true,
        custom_attributes = EXCLUDED.custom_attributes,
        updated_at = CURRENT_TIMESTAMP`,
      [
        contactId,
        bName,
        fullPhone,
        tag,
        JSON.stringify([tag]),
        segmentName,
        JSON.stringify(customAttrs),
      ]
    );

    // Also update conversation tag if conversation exists
    if (isDemoLead) {
      await query(
        `UPDATE conversations SET tag = 'Stage 1', updated_at = CURRENT_TIMESTAMP WHERE right(regexp_replace(phone, '[^0-9]', '', 'g'), 10) = $1`,
        [clean10]
      );
    }
  }

  console.log(`Synced contacts successfully!`);
  console.log(`- Ahmedabad: ${ahmedabadCount}`);
  console.log(`- Gandhinagar: ${gandhinagarCount}`);
  console.log(`- Marked as Stage 1 (Demo Leads): ${stage1Count}`);

  console.log('\n--- 2. Creating City Follow-Up Segments in Database ---');

  const segmentsToCreate = [
    {
      id: 'seg_ahmedabad_followup',
      name: 'Ahmedabad - Follow Up (Exclude Stage 1)',
      description: 'Ahmedabad optical stores excluding interested Stage 1 demo leads',
      conditions: [
        { category: 'field', field: 'segment', operator: 'is', value: 'Ahmedabad' },
        { category: 'tag', field: 'tag', operator: 'is_not', value: 'Stage 1' },
        { category: 'field', field: 'whatsapp_opted', operator: 'is', value: 'true' },
      ],
      logic: 'AND',
    },
    {
      id: 'seg_gandhinagar_followup',
      name: 'Gandhi Nagar - Follow Up (Exclude Stage 1)',
      description: 'Gandhinagar optical stores excluding interested Stage 1 demo leads',
      conditions: [
        { category: 'field', field: 'segment', operator: 'is', value: 'Gandhinagar' },
        { category: 'tag', field: 'tag', operator: 'is_not', value: 'Stage 1' },
        { category: 'field', field: 'whatsapp_opted', operator: 'is', value: 'true' },
      ],
      logic: 'AND',
    },
  ];

  for (const seg of segmentsToCreate) {
    let countSql = 'SELECT COUNT(*) FROM contacts WHERE 1=1';
    let params = [];
    const { clause, params: updatedParams } = buildConditionClause(seg.conditions, seg.logic, params);
    countSql += clause;
    params = updatedParams;

    const countRes = await query(countSql, params);
    const liveCount = parseInt(countRes.rows[0].count, 10);

    await query(
      `INSERT INTO segments (
        id, name, description, filter_type, conditions, estimated_count, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, 'custom', $4, $5, 'Shraddha Sharma', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        conditions = EXCLUDED.conditions,
        estimated_count = EXCLUDED.estimated_count,
        updated_at = CURRENT_TIMESTAMP`,
      [seg.id, seg.name, seg.description, JSON.stringify(seg.conditions), liveCount]
    );

    console.log(`Created Segment: "${seg.name}" -> Live Audience Count: ${liveCount}`);
  }

  console.log('\n--- 3. Verifying Final Segments in Database ---');
  const allSegs = await query('SELECT id, name, estimated_count, conditions FROM segments ORDER BY created_at ASC');
  console.log(JSON.stringify(allSegs.rows, null, 2));

  setTimeout(() => process.exit(0), 100);
}

syncAndCreateSegments().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
