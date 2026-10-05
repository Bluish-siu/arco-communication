import { pool } from '../config/db.js';

const KNOWN_CITIES = [
  'Surat',
  'Ahmedabad',
  'Rajkot',
  'Jamnagar',
  'Anand',
  'Gandhinagar',
  'Vadodara',
  'Mumbai',
  'Vasai',
  'Virar',
  'Bhavnagar',
  'Junagadh'
];

function extractCity(data) {
  if (!data) return null;
  const target = data.csvData || data;

  // Direct check
  if (target.City && typeof target.City === 'string' && target.City.trim()) {
    const c = target.City.trim();
    // Validate if it's not a phone number
    if (!/^\d+$/.test(c)) return c;
  }
  if (target.city && typeof target.city === 'string' && target.city.trim()) {
    const c = target.city.trim();
    if (!/^\d+$/.test(c)) return c;
  }

  // Check object values
  for (const [k, v] of Object.entries(target)) {
    if (typeof v === 'string') {
      const match = KNOWN_CITIES.find(kc => kc.toLowerCase() === v.trim().toLowerCase());
      if (match) return match;
    }
  }

  // Check Address or Area for known city
  const addressStr = (target.Address || target.address || target.Area || target.area || '') + '';
  for (const kc of KNOWN_CITIES) {
    if (new RegExp(`\\b${kc}\\b`, 'i').test(addressStr)) {
      return kc;
    }
  }

  return null;
}

async function run() {
  try {
    console.log('--- Scanning campaign recipients for city data ---');
    const recs = await pool.query(`
      SELECT phone, name, csv_data, campaign_id 
      FROM campaign_recipients 
      WHERE csv_data IS NOT NULL
    `);

    const phoneToCity = new Map();

    for (const r of recs.rows) {
      const cleanPhone = (r.phone || '').replace(/\D/g, '').slice(-10);
      if (!cleanPhone) continue;

      const cd = typeof r.csv_data === 'string' ? JSON.parse(r.csv_data) : r.csv_data;
      const city = extractCity(cd);
      if (city) {
        // Normalize city name casing
        const normalized = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
        phoneToCity.set(cleanPhone, normalized);
      }
    }

    console.log(`Mapped ${phoneToCity.size} phone numbers to cities from campaign recipients.`);

    // Fetch user's conversations
    const convs = await pool.query(`
      SELECT id, name, phone, tag, label 
      FROM conversations 
      WHERE user_id = 'usr_1790574599220'
    `);

    console.log(`Found ${convs.rows.length} conversations for user usr_1790574599220.`);

    let updatedCount = 0;
    const cityCounts = {};
    const unmapped = [];

    for (const conv of convs.rows) {
      const cleanPhone = (conv.phone || '').replace(/\D/g, '').slice(-10);
      let city = phoneToCity.get(cleanPhone);

      // Fallback check: If name or phone matches specific campaigns or known Vasai/Virar team numbers
      if (!city) {
        if (conv.name && (conv.name.includes('Bopal') || conv.name.includes('Satellite') || conv.name.includes('Ahmedabad'))) {
          city = 'Ahmedabad';
        }
      }

      if (city) {
        cityCounts[city] = (cityCounts[city] || 0) + 1;
        await pool.query(
          `UPDATE conversations 
           SET label = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2`,
          [city, conv.id]
        );
        updatedCount++;
      } else {
        unmapped.push({ id: conv.id, name: conv.name, phone: conv.phone });
      }
    }

    console.log(`\nSuccessfully updated ${updatedCount} conversations with city labels!`);
    console.log('City breakdown:');
    console.table(cityCounts);
    console.log(`Unmapped count: ${unmapped.length}`);
    if (unmapped.length > 0) {
      console.log('Sample unmapped:', unmapped.slice(0, 5));
    }

    // Also update contacts table custom_attributes / tag if contact exists
    const contactsRes = await pool.query(`
      SELECT id, phone, custom_attributes 
      FROM contacts 
      WHERE user_id = 'usr_1790574599220'
    `);
    let contactsUpdated = 0;
    for (const contact of contactsRes.rows) {
      const cleanPhone = (contact.phone || '').replace(/\D/g, '').slice(-10);
      const city = phoneToCity.get(cleanPhone);
      if (city) {
        const ca = typeof contact.custom_attributes === 'string' 
          ? JSON.parse(contact.custom_attributes || '{}') 
          : (contact.custom_attributes || {});
        ca.city = city;
        await pool.query(
          `UPDATE contacts 
           SET custom_attributes = $1 
           WHERE id = $2`,
          [JSON.stringify(ca), contact.id]
        );
        contactsUpdated++;
      }
    }
    console.log(`Updated ${contactsUpdated} contacts with city in custom_attributes.`);

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

run();
