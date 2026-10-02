import fs from 'fs';
import path from 'path';
import { query } from '../config/db.js';

async function exportCityFollowups() {
  const sql = `
    SELECT name, phone, status, csv_data 
    FROM campaign_recipients 
    WHERE campaign_id IN ('cmp_1790871237782', 'cmp_1790851009326')
    ORDER BY created_at ASC
  `;
  const res = await query(sql);
  const demoLeads = ['9624000799', '9601979996', '9712128736'];

  const ahmedabadLeads = new Map();
  const gandhinagarLeads = new Map();
  const excluded = [];

  for (const r of res.rows) {
    const clean10 = String(r.phone).replace(/\D/g, '').slice(-10);
    const cData = r.csv_data?.csvData || {};
    const city = (cData['City'] || '').trim().toLowerCase();

    if (demoLeads.includes(clean10)) {
      excluded.push({ name: r.name, phone: r.phone, city: cData['City'] || 'Unknown' });
      continue;
    }

    if (city === 'gandhinagar' || r.campaign_id === 'cmp_1790871237782') {
      if (!gandhinagarLeads.has(clean10)) {
        gandhinagarLeads.set(clean10, r);
      }
    } else {
      if (!ahmedabadLeads.has(clean10)) {
        ahmedabadLeads.set(clean10, r);
      }
    }
  }

  const headers = ['Business Name', 'Phone Number', 'Area', 'City', 'Address', 'Pincode', 'Rating', 'WhatsApp Opted'];

  const buildCsv = (leadMap) => {
    const lines = [headers.join(',')];
    for (const [clean10, r] of leadMap.entries()) {
      const cData = r.csv_data?.csvData || {};
      const bName = `"${(cData['Business Name'] || r.name || '').replace(/"/g, '""')}"`;
      const phone = `"${r.phone || cData['Phone Number'] || clean10}"`;
      const area = `"${(cData['Area'] || '').replace(/"/g, '""')}"`;
      const city = `"${(cData['City'] || '').replace(/"/g, '""')}"`;
      const address = `"${(cData['Address'] || '').replace(/"/g, '""')}"`;
      const pincode = `"${cData['Pincode'] || ''}"`;
      const rating = `"${cData['Rating'] || ''}"`;
      lines.push([bName, phone, area, city, address, pincode, rating, 'true'].join(','));
    }
    return lines.join('\n');
  };

  const ahmedabadCsv = buildCsv(ahmedabadLeads);
  const gandhinagarCsv = buildCsv(gandhinagarLeads);

  const outAhm = path.resolve(process.cwd(), 'followup_ahmedabad_81_optical_shops.csv');
  const outGnd = path.resolve(process.cwd(), 'followup_gandhinagar_37_optical_shops.csv');

  fs.writeFileSync(outAhm, ahmedabadCsv, 'utf-8');
  fs.writeFileSync(outGnd, gandhinagarCsv, 'utf-8');

  console.log(`Saved Ahmedabad CSV: ${outAhm} (${ahmedabadLeads.size} shops)`);
  console.log(`Saved Gandhinagar CSV: ${outGnd} (${gandhinagarLeads.size} shops)`);
  console.log(`Total excluded demo leads:`, JSON.stringify(excluded, null, 2));
  setTimeout(() => process.exit(0), 100);
}

exportCityFollowups().catch((err) => {
  console.error(err);
  process.exit(1);
});
