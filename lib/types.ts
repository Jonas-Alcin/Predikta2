export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      leagues: {
        Row: {
          id: string
          name: string
          country: string | null
          logo_url: string | null
          slug: string | null
        }
        Insert: {
          id?: string
          name: string
          country?: string | null
          logo_url?: string | null
          slug?: string | null
        }
        Update: {
          id?: string
          name?: string
          country?: string | null
          logo_url?: string | null
          slug?: string | null
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          league_id: string | null
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          league_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          league_id?: string | null
        }
      }
      matches: {
        Row: {
          id: string
          home_team_id: string | null
          away_team_id: string | null
          league_id: string | null
          match_date: string
          status: 'upcoming' | 'live' | 'finished' | null
          home_score: number | null
          away_score: number | null
          minute: number | null
          odds_home: number | null
          odds_draw: number | null
          odds_away: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          home_team_id?: string | null
          away_team_id?: string | null
          league_id?: string | null
          match_date: string
          status?: 'upcoming' | 'live' | 'finished' | null
          home_score?: number | null
          away_score?: number | null
          minute?: number | null
          odds_home?: number | null
          odds_draw?: number | null
          odds_away?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          home_team_id?: string | null
          away_team_id?: string | null
          league_id?: string | null
          match_date?: string
          status?: 'upcoming' | 'live' | 'finished' | null
          home_score?: number | null
          away_score?: number | null
          minute?: number | null
          odds_home?: number | null
          odds_draw?: number | null
          odds_away?: number | null
          created_at?: string | null
        }
      }
      predictions: {
        Row: {
          id: string
          match_id: string | null
          bet_label: string
          bet_type: string
          confidence: number | null
          risk_level: 'safe' | 'medium' | 'high' | null
          reasoning: string | null
          home_form: string[] | null
          away_form: string[] | null
          h2h_summary: string | null
          alternatives: string[] | null
          is_featured: boolean | null
          created_at: string | null
        }
        Insert: {
          id?: string
          match_id?: string | null
          bet_label: string
          bet_type: string
          confidence?: number | null
          risk_level?: 'safe' | 'medium' | 'high' | null
          reasoning?: string | null
          home_form?: string[] | null
          away_form?: string[] | null
          h2h_summary?: string | null
          alternatives?: string[] | null
          is_featured?: boolean | null
          created_at?: string | null
        }
        Update: {
          id?: string
          match_id?: string | null
          bet_label?: string
          bet_type?: string
          confidence?: number | null
          risk_level?: 'safe' | 'medium' | 'high' | null
          reasoning?: string | null
          home_form?: string[] | null
          away_form?: string[] | null
          h2h_summary?: string | null
          alternatives?: string[] | null
          is_featured?: boolean | null
          created_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          avatar_url: string | null
          plan: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          username?: string | null
          avatar_url?: string | null
          plan?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          avatar_url?: string | null
          plan?: string | null
          created_at?: string | null
        }
      }
      user_saved_bets: {
        Row: {
          id: string
          user_id: string | null
          prediction_id: string | null
          saved_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          prediction_id?: string | null
          saved_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          prediction_id?: string | null
          saved_at?: string | null
        }
      }
    }
  }
}

// --- API-Football Types ---
export interface APIFootballFixture {
  fixture: {
    id: number;
    date: string;
    status: {
      short: string; // "NS", "1H", "HT", "2H", "FT"
      long: string;
      elapsed: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country?: string;
    logo: string;
    season?: number;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner: boolean | null;
    };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
}
