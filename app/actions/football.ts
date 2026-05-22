"use server";

import { APIFootballFixture } from "@/lib/types";

// Preferidas
const TOP_LEAGUES = ['Premier League', 'Serie A', 'LaLiga', 'Primera Division', 'Champions League', 'Bundesliga', 'Ligue 1'];

async function fetchStatPalLive(): Promise<APIFootballFixture[]> {
  const apiKey = process.env.STATPAL_ACCESS_KEY;
  if (!apiKey) return [];

  const response = await fetch(`https://statpal.io/api/v2/soccer/matches/live?access_key=${apiKey}`, {
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

  const leagues = data.live_matches?.league || [];
  let allMatches: APIFootballFixture[] = [];

  leagues.forEach((l: any) => {
    let matches = l.match;
    if (!Array.isArray(matches)) matches = [matches];

    matches.forEach((m: any) => {
      if (!m || !m.main_id) return;
      
      // Parse date: "22.05.2026" and time "13:00" -> ISO string
      let isoDate = new Date().toISOString();
      try {
        const parts = m.date.split('.');
        if (parts.length === 3) {
          isoDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T${m.time || '00:00'}:00Z`).toISOString();
        }
      } catch(e) {}

      // Clean up league name (e.g. "Italy: Serie A" -> "Serie A")
      const cleanLeagueName = l.name.includes(': ') ? l.name.split(': ')[1] : l.name;

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
    let matches = await fetchStatPalLive();
    
    // Sort to prioritize top leagues
    matches = matches.sort((a, b) => {
      const aTop = TOP_LEAGUES.some(tl => a.league.name.includes(tl));
      const bTop = TOP_LEAGUES.some(tl => b.league.name.includes(tl));
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
    let matches = await fetchStatPalLive();
    
    // Since statpal live endpoint returns today's matches, we will just return them 
    // as if they were for the requested date to keep the UI from breaking
    
    // Filter out postponed/cancelled just in case
    matches = matches.filter(m => m.fixture.status.short !== 'PST');
    
    // Sort to prioritize top leagues FIRST, then by time
    matches = matches.sort((a, b) => {
      const aTop = TOP_LEAGUES.some(tl => a.league.name.includes(tl));
      const bTop = TOP_LEAGUES.some(tl => b.league.name.includes(tl));
      if (aTop && !bTop) return -1;
      if (!aTop && bTop) return 1;
      return new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime();
    });

    return matches.slice(0, 30); // Return up to 30 matches for the matches page
  } catch (error) {
    console.error("Error fetching matches by date:", error);
    return [];
  }
}

export async function getMatchById(matchId: number): Promise<APIFootballFixture | null> {
  try {
    const matches = await fetchStatPalLive();
    const match = matches.find(m => m.fixture.id === matchId);
    return match || null;
  } catch (error) {
    console.error(`Error fetching match ${matchId}:`, error);
    return null;
  }
}

export async function getTeamForm(teamId: number, season: number = new Date().getFullYear()): Promise<string[]> {
  // Deshabilitado temporalmente hasta tener endpoints de H2H de StatPal
  return [];
}

export async function getH2HStats(team1Id: number, team2Id: number): Promise<{ team1Wins: number, team2Wins: number, draws: number, total: number } | null> {
  // Deshabilitado temporalmente hasta tener endpoints de H2H de StatPal
  return null;
}
