"use server";

import { APIFootballFixture } from "@/lib/types";

// Preferidas - Exact match normalization mapping to frontend LEAGUES
const LEAGUE_MAPPING: Record<string, string> = {
  'england: premier league': 'Premier League',
  'spain: laliga': 'La Liga',
  'italy: serie a': 'Serie A',
  'germany: bundesliga': 'Bundesliga',
  'france: ligue 1': 'Ligue 1',
  'brazil: serie a': 'Brasileirão',
  'chile: primera division': 'Primera División (CL)',
  'europe: uefa champions league': 'Champions League',
  'europe: uefa europa league': 'Europa League',
};
const TOP_LEAGUES = Object.values(LEAGUE_MAPPING);

async function fetchStatPalMatches(offset: number = 0): Promise<APIFootballFixture[]> {
  const apiKey = process.env.STATPAL_ACCESS_KEY;
  if (!apiKey) return [];

  const response = await fetch(`https://statpal.io/api/v2/soccer/matches/daily?offset=${offset}&access_key=${apiKey}`, {
    next: { revalidate: 60 }
  });

  if (!response.ok) return [];
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    return [];
  }

  // The root key changes based on offset, e.g. "live_matches" or "matches_23_05_2026"
  const root = Object.values(data)[0] as any;
  if (!root) return [];
  
  const leagues = root.league || [];
  let allMatches: APIFootballFixture[] = [];

  leagues.forEach((l: any) => {
    let matches = l.match;
    if (!Array.isArray(matches)) matches = [matches];

    // Normalize league name
    const normName = l.name.toLowerCase();
    const cleanLeagueName = LEAGUE_MAPPING[normName] || (l.name.includes(': ') ? l.name.split(': ')[1] : l.name);

    matches.forEach((m: any) => {
      if (!m || !m.main_id) return;
      
      let isoDate = new Date().toISOString();
      try {
        const parts = m.date.split('.');
        if (parts.length === 3) {
          isoDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T${m.time || '00:00'}:00Z`).toISOString();
        }
      } catch(e) {}

      allMatches.push({
        fixture: {
          id: Number(m.main_id),
          date: isoDate,
          status: {
            short: m.status === 'Not Started' ? 'NS' : m.status === 'Postp.' ? 'PST' : 'LIVE',
            long: m.status
          }
        },
        league: {
          id: Number(l.id || 0),
          name: cleanLeagueName,
          logo: '',
          season: new Date().getFullYear()
        },
        teams: {
          home: {
            id: Number(m.home?.id || 0),
            name: m.home?.name || 'Unknown',
            logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(m.home?.name || 'U')}&background=131418&color=fff&bold=true`,
            winner: null
          },
          away: {
            id: Number(m.away?.id || 0),
            name: m.away?.name || 'Unknown',
            logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(m.away?.name || 'U')}&background=131418&color=fff&bold=true`,
            winner: null
          }
        },
        goals: {
          home: m.home?.goals === '?' ? null : Number(m.home?.goals || 0),
          away: m.away?.goals === '?' ? null : Number(m.away?.goals || 0)
        }
      });
    });
  });

  return allMatches;
}

export async function getTodaysMatches(): Promise<APIFootballFixture[]> {
  try {
    let matches = await fetchStatPalMatches(0);
    
    // Sort to prioritize top leagues
    matches = matches.sort((a, b) => {
      const aTop = TOP_LEAGUES.includes(a.league.name);
      const bTop = TOP_LEAGUES.includes(b.league.name);
      if (aTop && !bTop) return -1;
      if (!aTop && bTop) return 1;
      return 0;
    });

    return matches.slice(0, 6);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
}

export async function getMatchesByDate(dateString: string): Promise<APIFootballFixture[]> {
  try {
    // Calculate offset based on target date vs today
    const targetDate = new Date(dateString);
    const today = new Date();
    // Normalize to midnight UTC to safely calculate day differences
    const targetUTC = Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate());
    const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    
    let offset = Math.round((targetUTC - todayUTC) / 86400000);
    
    // Safety check just in case, clamp between -7 and 7
    offset = Math.max(-7, Math.min(7, offset));
    
    let matches = await fetchStatPalMatches(offset);
    
    // Filter out postponed/cancelled just in case
    matches = matches.filter(m => m.fixture.status.short !== 'PST');
    
    // Sort to prioritize top leagues FIRST, then by time
    matches = matches.sort((a, b) => {
      const aTop = TOP_LEAGUES.includes(a.league.name);
      const bTop = TOP_LEAGUES.includes(b.league.name);
      if (aTop && !bTop) return -1;
      if (!aTop && bTop) return 1;
      return new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime();
    });

    return matches.slice(0, 50); // Return up to 50 matches to ensure we have enough across all leagues
  } catch (error) {
    console.error("Error fetching matches by date:", error);
    return [];
  }
}

export async function getMatchById(matchId: number): Promise<APIFootballFixture | null> {
  try {
    // Search up to 3 days around today since we don't have a direct /match/{id} endpoint
    for (const offset of [-1, 0, 1, 2]) {
      const matches = await fetchStatPalMatches(offset);
      const match = matches.find(m => m.fixture.id === matchId);
      if (match) return match;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching match ${matchId}:`, error);
    return null;
  }
}

export async function getTeamForm(teamId: number, season: number = new Date().getFullYear()): Promise<string[]> {
  return [];
}

export async function getH2HStats(team1Id: number, team2Id: number): Promise<{ team1Wins: number, team2Wins: number, draws: number, total: number } | null> {
  return null;
}
