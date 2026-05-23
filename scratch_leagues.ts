import fs from 'fs';
import path from 'path';

// Load .env.local manually
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const keyMatch = envContent.match(/STATPAL_ACCESS_KEY=([^\n]+)/);
const apiKey = keyMatch ? keyMatch[1].trim() : null;

async function checkLeagues() {
  const leaguesSet = new Set<string>();
  
  for (const offset of [-1, 0, 1, 2]) {
    const response = await fetch(`https://statpal.io/api/v2/soccer/matches/daily?offset=${offset}&access_key=${apiKey}`);
    const text = await response.text();
    const data = JSON.parse(text);
    const root = Object.values(data)[0] as any;
    const leagues = root.league || [];
    
    leagues.forEach((l: any) => {
      if (l.name.toLowerCase().includes('chile') || l.name.toLowerCase().includes('primera')) {
        leaguesSet.add(l.name.toLowerCase());
      }
      leaguesSet.add(l.name.toLowerCase());
    });
  }
  
  console.log("Leagues containing 'chile' or 'primera':");
  Array.from(leaguesSet)
    .filter(name => name.includes('chile') || name.includes('primera'))
    .forEach(name => console.log(name));
}
checkLeagues();
