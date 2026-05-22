"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export type SavedBet = {
  id: string;
  fixture_id: number;
  league_name: string;
  team_home: string;
  team_away: string;
  match_date: string;
  bet_type: string;
  prediction_text: string;
  odds: string;
  created_at: string;
};

export type AnalysisHistory = {
  id: string;
  fixture_id: number;
  league_name: string;
  team_home: string;
  team_away: string;
  match_date: string;
  analysis_summary: string;
  created_at: string;
};

const SavedBetSchema = z.object({
  fixture_id: z.number().int().positive(),
  league_name: z.string().max(100),
  team_home: z.string().max(100),
  team_away: z.string().max(100),
  match_date: z.string().datetime({ offset: true }).or(z.string()),
  bet_type: z.string().max(50),
  prediction_text: z.string().max(300),
  odds: z.string().max(20)
});

export async function saveBet(data: Omit<SavedBet, "id" | "created_at">) {
  try {
    const parsedData = SavedBetSchema.parse(data);

    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    
    if (!authData.user) return { success: false, error: "No autenticado" };

    const { error } = await supabase.from("saved_bets").insert({
      user_id: authData.user.id,
      ...parsedData
    });

    if (error) {
      console.error("Error saving bet:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Exception saving bet:", err);
    return { success: false, error: "Internal error" };
  }
}

export async function removeSavedBet(fixture_id: number) {
  try {
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    
    if (!authData.user) return { success: false, error: "No autenticado" };

    const { error } = await supabase.from("saved_bets").delete()
      .eq("user_id", authData.user.id)
      .eq("fixture_id", fixture_id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: "Internal error" };
  }
}

export async function isBetSaved(fixture_id: number): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return false;

    const { data, error } = await supabase.from("saved_bets")
      .select("id")
      .eq("user_id", authData.user.id)
      .eq("fixture_id", fixture_id)
      .single();

    return !!data && !error;
  } catch (err) {
    return false;
  }
}

export async function getSavedBets(): Promise<SavedBet[]> {
  try {
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    
    if (!authData.user) return [];

    const { data, error } = await supabase.from("saved_bets")
      .select("*")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error getting saved bets:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Exception getting saved bets:", err);
    return [];
  }
}

const AnalysisHistorySchema = z.object({
  fixture_id: z.number().int().positive(),
  league_name: z.string().max(100),
  team_home: z.string().max(100),
  team_away: z.string().max(100),
  match_date: z.string().datetime({ offset: true }).or(z.string()),
  analysis_summary: z.string().max(1500)
});

export async function logAnalysis(data: Omit<AnalysisHistory, "id" | "created_at">) {
  try {
    const parsedData = AnalysisHistorySchema.parse(data);

    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    
    if (!authData.user) return { success: false };

    // Evitar duplicados del mismo partido hoy
    const { data: existing } = await supabase.from("analysis_history")
      .select("id")
      .eq("user_id", authData.user.id)
      .eq("fixture_id", parsedData.fixture_id)
      .single();

    if (existing) return { success: true };

    const { error } = await supabase.from("analysis_history").insert({
      user_id: authData.user.id,
      ...parsedData
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}

export async function getAnalysisHistory(): Promise<AnalysisHistory[]> {
  try {
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    
    if (!authData.user) return [];

    const { data, error } = await supabase.from("analysis_history")
      .select("*")
      .eq("user_id", authData.user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) return [];
    return data || [];
  } catch (err) {
    return [];
  }
}
