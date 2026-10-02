import fs from 'fs';
import path from 'path';
import { query } from '../config/db.js';

async function exportFollowup() {
  const sql = `
    SELECT name, phone, status, csv_data 
    FROM campaign_recipients 
    WHERE campaign_id IN ('cmp_1790871237782', 'cmp_1790851009326')
    ORDER BY created_at ASC
  `;
  const res = await query(sql);
  const demoLeads = ['9624000799', '9601979996', '9712128736'];
  const byPhone = new Map();
  const excluded = [];

  for (const r of res.rows) {
    const clean10 = String(r.phone).replace(/\D/g, '').slice(-10);
    if (demoLeads.includes(clean10)) {
      excluded.push({ name: r.name, phone: r.phone });
      continue;
    }
    if (!byPhone.has(clean10)) {
      byPhone.set(clean10, r);
    }
  }

  const headers = ['Business Name', 'Phone Number', 'Area', 'City', 'Address', 'Pincode', 'Rating', 'WhatsApp Opted'];
  const csvLines = [headers.join(',')];

  for (const [clean10, r] of byPhone.entries()) {
    const cData = r.csv_data?.csvData || {};
    const bName = `"${(cData['Business Name'] || r.name || '').replace(/"/g, '""')}"`;
    const phone = `"${r.phone || cData['Phone Number'] || clean10}"`;
    const area = `"${(cData['Area'] || '').replace(/"/g, '""')}"`;
    const city = `"${(cData['City'] || '').replace(/"/g, '""')}"`;
    const address = `"${(cData['Address'] || '').replace(/"/g, '""')}"`;
    const pincode = `"${cData['Pincode'] || ''}"`;
    const rating = `"${cData['Rating'] || ''}"`;

    csvLines.push([bName, phone, area, city, address, pincode, rating, 'true'].join(','));
  }

  const outPath = path.resolve(process.cwd(), 'followup_campaign_118_optical_shops.csv');
  fs.writeFileSync(outPath, csvLines.join('\n'), 'utf-8');

  console.log(`Successfully generated follow-up audience CSV: ${outPath}`);
  console.log(`Total recipients: ${byPhone.size}`);
  console.log(`Excluded ${excluded.length} Demo leads:`, JSON.stringify(excluded));
  process.exit(0);
}

exportFollowup().catch((err) => {
  console.error(err);
  process.exit(1);
});
