import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const LATEST_URL = 'https://rad.icmt.cc/latest';
const HISTORY_URL = 'https://rad.icmt.cc/history?window=1day';

async function seed() {
  console.log('Reading config...');
  // Default values from worker.js style config
  const intervalMs = 300000;
  const cpmToUsv = 0.0018;
  const intervalMins = intervalMs / 60000;

  console.log('Fetching latest data from production...');
  const latestResponse = await fetch(LATEST_URL);
  const latestData = await latestResponse.json();

  if (latestData.latest) {
    console.log('Seeding KV "latest" key...');
    const kvValue = JSON.stringify(latestData.latest);
    // Use npx wrangler for local execution
    execSync(`npx wrangler kv:key put --binding RAD_KV "latest" '${kvValue}' --local`);
  }

  console.log('Fetching historical data from production (1 day)...');
  const historyResponse = await fetch(HISTORY_URL);
  const historyData = await historyResponse.json();

  if (historyData.data && historyData.data.length > 0) {
    console.log(`Preparing to seed D1 with ${historyData.data.length} records...`);

    // Invert the formula used in worker.js to store "clicks" that result in the same USV
    // usv = (clicks / intervalMins) * cpmToUsv  =>  clicks = (usv * intervalMins) / cpmToUsv
    const sqlValues = historyData.data.map(row => {
      const clicks = (row.usv * intervalMins) / cpmToUsv;
      return `(${row.ts}, ${clicks})`;
    }).join(', ');

    const sqlScript = `INSERT INTO readings (ts, clicks) VALUES ${sqlValues};`;
    const tempSqlPath = path.join(process.cwd(), 'temp_seed.sql');
    fs.writeFileSync(tempSqlPath, sqlScript);

    try {
      console.log('Executing D1 seed script...');
      execSync(`npx wrangler d1 execute RAD_D1 --local --file="${tempSqlPath}"`);
    } finally {
      if (fs.existsSync(tempSqlPath)) {
        fs.unlinkSync(tempSqlPath);
      }
    }
    console.log('Seeding complete successfully!');
  } else {
    console.warn('No historical data found to seed.');
  }
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
