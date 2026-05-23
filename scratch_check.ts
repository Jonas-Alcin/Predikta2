import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const keyMatch = envContent.match(/STATPAL_ACCESS_KEY=([^\n]+)/);
const apiKey = keyMatch ? keyMatch[1].trim() : null;

async function check() {
  console.log("Key found:", !!apiKey);
  const response = await fetch(`https://statpal.io/api/v2/soccer/matches/daily?offset=0&access_key=${apiKey}`);
  const text = await response.text();
  const data = JSON.parse(text);
  const root = Object.values(data)[0] as any;
  const leagues = root.league || [];
  
  leagues.slice(0,2).forEach((l: any) => {
    let matches = l.match;
    if (!Array.isArray(matches)) matches = [matches];
    matches.slice(0, 3).forEach((m: any) => {
      console.log(`Match: ${m.home?.name} vs ${m.away?.name}`);
      console.log(`Raw status: '${m.status}'`);
      console.log(`Raw time: '${m.time}'`);
      console.log('---');
    });
  });
}
check();
