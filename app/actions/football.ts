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

    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const response = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-apisports-key': apiKey,
      },
      // Cache for 60 seconds to avoid exceeding API limits on page reloads
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      console.error("Failed to fetch from API-Football:", response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (!data.response || !Array.isArray(data.response)) {
      return [];
    }

    let matches: APIFootballFixture[] = data.response;
    
    // Filter by top leagues
    matches = matches.filter(m => TOP_LEAGUE_IDS.includes(m.league.id));

    // Filter to only include matches that are upcoming, live, or finished today
    // and sort them to prioritize LIVE matches, then upcoming, then finished.
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
