import { query } from './db.js';

const INTERAKT_TAGS = [
  'Repeat Buyers',
  'Recovered',
  'Order Placed(Prepaid)',
  'Order Placed(CoD)',
  'Loyal',
  'Lost',
  'High Spenders',
  'Curious Browsers',
  'At Risk',
  'Abandoned Cart',
];

async function syncInteraktData() {
  try {
    console.log('Distributing 10 Interakt tags across contacts database...');

    // 1. Assign tags cyclically/proportionally to all contacts
    const contactsRes = await query('SELECT id FROM contacts ORDER BY created_at ASC');
    console.log(`Updating ${contactsRes.rows.length} contacts with Interakt tags...`);

    for (let i = 0; i < contactsRes.rows.length; i++) {
      const contactId = contactsRes.rows[i].id;
      const primaryTag = INTERAKT_TAGS[i % INTERAKT_TAGS.length];
      const secondaryTag = INTERAKT_TAGS[(i + 3) % INTERAKT_TAGS.length];
      const tagsArray = JSON.stringify([primaryTag, secondaryTag]);

      await query(
        'UPDATE contacts SET tag = $1, tags = $2::jsonb WHERE id = $3',
        [primaryTag, tagsArray, contactId]
      );
    }

    console.log('Contacts tags updated successfully.');

    // 2. Update default saved segments in segments table to match Interakt tags & fields
    await query('DELETE FROM segments');
    console.log('Refreshed segments table.');

    const defaultSegments = [
      {
        id: 'seg_repeat_buyers',
        name: 'Repeat Buyers',
        description: 'Verified repeat customers with active purchase history.',
        filter_type: 'tag',
        conditions: JSON.stringify([
          { category: 'tag', field: 'tag', operator: 'is', value: 'Repeat Buyers' },
          { category: 'field', field: 'whatsapp_opted', operator: 'is', value: 'true' },
        ]),
        estimated_count: 147,
      },
      {
        id: 'seg_high_spenders',
        name: 'High Spenders Club',
        description: 'Top tier VIP accounts with highest order deal values.',
        filter_type: 'tag',
        conditions: JSON.stringify([
          { category: 'tag', field: 'tag', operator: 'is', value: 'High Spenders' },
        ]),
        estimated_count: 147,
      },
      {
        id: 'seg_cart_recovery',
        name: 'Cart Abandoners Recovery',
        description: 'Shoppers with abandoned carts ready for WhatsApp recovery broadcast.',
        filter_type: 'tag',
        conditions: JSON.stringify([
          { category: 'tag', field: 'tag', operator: 'is', value: 'Abandoned Cart' },
          { category: 'field', field: 'whatsapp_opted', operator: 'is', value: 'true' },
        ]),
        estimated_count: 132,
      },
      {
        id: 'seg_at_risk_retention',
        name: 'At Risk Customers',
        description: 'Dormant or at-risk customers targeted for win-back campaigns.',
        filter_type: 'tag',
        conditions: JSON.stringify([
          { category: 'tag', field: 'tag', operator: 'is', value: 'At Risk' },
        ]),
        estimated_count: 147,
      },
    ];

    for (const seg of defaultSegments) {
      await query(
        `INSERT INTO segments (id, name, description, filter_type, conditions, estimated_count, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'Shraddha', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [seg.id, seg.name, seg.description, seg.filter_type, seg.conditions, seg.estimated_count]
      );
    }

    console.log('Saved segments seeded successfully.');

    // 3. Verify counts per tag
    for (const tag of INTERAKT_TAGS) {
      const tagCount = await query('SELECT COUNT(*) FROM contacts WHERE tag = $1 OR tags @> jsonb_build_array($1::text)', [tag]);
      console.log(`Tag "${tag}": ${tagCount.rows[0].count} matching contacts`);
    }

    // 4. Verify saved segments
    const segsRes = await query('SELECT id, name, estimated_count FROM segments');
    console.log('Available Segments:', segsRes.rows);

  } catch (err) {
    console.error('Error syncing Interakt data:', err);
  } finally {
    process.exit(0);
  }
}

syncInteraktData();
