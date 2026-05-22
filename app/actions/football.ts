"use server";

import { APIFootballFixture } from "@/lib/types";

// Major leagues to avoid showing lower tier leagues with the same names
const TOP_LEAGUE_IDS = [39, 140, 135, 78, 61, 2, 3, 4, 9, 1, 265, 71];

export async function getTodaysMatches(): Promise<APIFootballFixture[]> {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) {
      console.error("API_FOOTBALL_KEY is not defined in environment variables");
      return [];
    }

    // Get current date and next few days
    const today = new Date();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today); dayAfter.setDate(dayAfter.getDate() + 2);

    const dates = [
      today.toISOString().split('T')[0],
      tomorrow.toISOString().split('T')[0],
      dayAfter.toISOString().split('T')[0]
    ];

    let allMatches: APIFootballFixture[] = [];

    // Fetch up to 3 days until we have enough matches
    for (const d of dates) {
      const response = await fetch(`https://v3.football.api-sports.io/fixtures?date=${d}`, {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'v3.football.api-sports.io',
          'x-apisports-key': apiKey,
        },
        next: { revalidate: 60 }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.response && Array.isArray(data.response)) {
          allMatches = [...allMatches, ...data.response];
        }
      }
    }

    let matches = allMatches;
    
    // Filter by top leagues
    matches = matches.filter(m => TOP_LEAGUE_IDS.includes(m.league.id));

    // Filter out finished or cancelled matches (only keep Upcoming NS, and Live 1H, HT, 2H, ET, P)
    const finishedStatuses = ['FT', 'AET', 'PEN', 'PST', 'CANC', 'ABD', 'AWD', 'WO'];
    matches = matches.filter(m => !finishedStatuses.includes(m.fixture.status.short));

    // Sort them to prioritize LIVE matches, then upcoming
    matches = matches.sort((a, b) => {
      const aLive = a.fixture.status.short === '1H' || a.fixture.status.short === '2H' || a.fixture.status.short === 'HT';
      const bLive = b.fixture.status.short === '1H' || b.fixture.status.short === '2H' || b.fixture.status.short === 'HT';
      
      if (aLive && !bLive) return -1;
      if (!aLive && bLive) return 1;
      
      return new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime();
    });

    // Return the top 6 matches for the dashboard
    return matches.slice(0, 6);
  } catch (error) {
    console.error("Error fetching matches:", error);
    return [];
  }
}

export async function getMatchesByDate(dateString: string): Promise<APIFootballFixture[]> {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) return [];

    const response = await fetch(`https://v3.football.api-sports.io/fixtures?date=${dateString}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-apisports-key': apiKey,
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) return [];
    const data = await response.json();
    if (!data.response || !Array.isArray(data.response)) return [];

    let matches: APIFootballFixture[] = data.response;
    // Filter by top leagues
    matches = matches.filter(m => TOP_LEAGUE_IDS.includes(m.league.id));
    
    // Filter out finished or cancelled matches
    const finishedStatuses = ['FT', 'AET', 'PEN', 'PST', 'CANC', 'ABD', 'AWD', 'WO'];
    matches = matches.filter(m => !finishedStatuses.includes(m.fixture.status.short));
    
    // Sort by time
    matches = matches.sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime());
    return matches;
  } catch (error) {
    console.error("Error fetching matches by date:", error);
    return [];
  }
}

export async function getMatchById(matchId: number): Promise<APIFootballFixture | null> {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) return null;

    const response = await fetch(`https://v3.football.api-sports.io/fixtures?id=${matchId}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-apisports-key': apiKey,
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) return null;
    const data = await response.json();
    
    if (!data.response || !Array.isArray(data.response) || data.response.length === 0) {
      return null;
    }

    return data.response[0] as APIFootballFixture;
  } catch (error) {
    console.error(`Error fetching match ${matchId}:`, error);
    return null;
  }
}

export async function getTeamForm(teamId: number, season: number = new Date().getFullYear()): Promise<string[]> {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) return [];

    const response = await fetch(`https://v3.football.api-sports.io/fixtures?team=${teamId}&season=${season}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-apisports-key': apiKey,
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) return [];
    const data = await response.json();
    
    if (!data.response || !Array.isArray(data.response)) return [];

    // Filter finished matches, sort by date descending, take top 5
    const finishedStatuses = ['FT', 'AET', 'PEN'];
    const matches = data.response
      .filter((m: any) => finishedStatuses.includes(m.fixture.status.short))
      .sort((a: any, b: any) => new Date(b.fixture.date).getTime() - new Date(a.fixture.date).getTime())
      .slice(0, 5);

    // Map to W, D, L
    return matches.map((m: any) => {
      const isHome = m.teams.home.id === teamId;
      const winner = isHome ? m.teams.home.winner : m.teams.away.winner;
      if (winner === true) return 'W';
      if (winner === false) return 'L';
      return 'D';
    });
  } catch (error) {
    console.error(`Error fetching form for team ${teamId}:`, error);
    return [];
  }
}

export async function getH2HStats(team1Id: number, team2Id: number): Promise<{ team1Wins: number, team2Wins: number, draws: number, total: number }> {
  try {
    const apiKey = process.env.API_FOOTBALL_KEY;
    if (!apiKey) return { team1Wins: 0, team2Wins: 0, draws: 0, total: 0 };

    const response = await fetch(`https://v3.football.api-sports.io/fixtures/headtohead?h2h=${team1Id}-${team2Id}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-apisports-key': apiKey,
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) return { team1Wins: 0, team2Wins: 0, draws: 0, total: 0 };
    const data = await response.json();
    
    if (!data.response || !Array.isArray(data.response)) return { team1Wins: 0, team2Wins: 0, draws: 0, total: 0 };

    const matches = data.response.filter((m: any) => ['FT', 'AET', 'PEN'].includes(m.fixture.status.short));
    
    let team1Wins = 0;
    let team2Wins = 0;
    let draws = 0;

    matches.forEach((m: any) => {
      if (m.teams.home.id === team1Id) {
        if (m.teams.home.winner === true) team1Wins++;
        else if (m.teams.away.winner === true) team2Wins++;
        else draws++;
      } else {
        if (m.teams.home.winner === true) team2Wins++;
        else if (m.teams.away.winner === true) team1Wins++;
        else draws++;
      }
    });

    return { team1Wins, team2Wins, draws, total: matches.length };
  } catch (error) {
    console.error(`Error fetching H2H for ${team1Id}-${team2Id}:`, error);
    return { team1Wins: 0, team2Wins: 0, draws: 0, total: 0 };
  }
}
