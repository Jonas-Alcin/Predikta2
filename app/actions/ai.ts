"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getTodaysMatches, getMatchById, getH2HStats, getTeamForm } from '@/app/actions/football';

const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 5; 
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export type AILeg = {
  title: string;
  subtitle: string;
  date: string;
  leagueIcon?: string;
};

export type AIPredictionResult = {
  reasoning: string;
  bets: Array<{ 
    level: string; // "Conservadora", "Equilibrada", "Alto Riesgo"
    title: string; 
    description: string;
    legs: AILeg[];
  }>;
};

export async function generatePredictionAnalysis(fixtureId: number): Promise<AIPredictionResult | null> {
  const targetMatch = await getMatchById(fixtureId);
  if (!targetMatch) return null;

  try {
    const supabase = createClient();
    const { data: authData } = await supabase.auth.getUser();
    
    if (!authData.user) {
      console.warn("Unauthorized attempt to access AI");
      return null;
    }

    const userId = authData.user.id;
    const now = Date.now();
    const userRequests = rateLimitMap.get(userId) || [];
    
    const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);
    
    if (recentRequests.length >= RATE_LIMIT_MAX) {
      console.warn(`Rate limit exceeded for user ${userId}`);
      throw new Error("Rate limit exceeded. Try again later.");
    }
    
    recentRequests.push(now);
    rateLimitMap.set(userId, recentRequests);

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) throw new Error("Missing ANTHROPIC_API_KEY");

    const anthropic = new Anthropic({
      apiKey: anthropicKey,
    });

    const h2h = await getH2HStats(targetMatch.teams.home.id, targetMatch.teams.away.id);
    const homeForm = await getTeamForm(targetMatch.teams.home.id);
    const awayForm = await getTeamForm(targetMatch.teams.away.id);

    const homeWins = homeForm.filter((f: string) => f === 'W').length;
    const awayWins = awayForm.filter((f: string) => f === 'W').length;
    
    let statsContext = `Estadísticas del Partido Principal (${targetMatch.teams.home.name} vs ${targetMatch.teams.away.name}):
- Forma reciente Local: ${homeWins} victorias en últimos 5.
- Forma reciente Visitante: ${awayWins} victorias en últimos 5.\n`;
    if (h2h && h2h.total > 0) {
      statsContext += `- H2H: Local ganó ${h2h.team1Wins}, Visitante ganó ${h2h.team2Wins}, ${h2h.draws} empates.\n`;
    }

    // Get other matches of the day to build parlays
    const todaysMatches = await getTodaysMatches();
    const otherMatches = todaysMatches.filter(m => m.fixture.id !== fixtureId).slice(0, 5);
    
    let otherMatchesContext = `Otros partidos disponibles hoy para armar las combinadas:\n`;
    otherMatches.forEach(m => {
      otherMatchesContext += `- ${m.teams.home.name} vs ${m.teams.away.name} (Liga: ${m.league.name}, Fecha: ${new Date(m.fixture.date).toLocaleDateString()})\n`;
    });

    const prompt = `
Eres un analista deportivo experto. El usuario está viendo el partido ${targetMatch.teams.home.name} vs ${targetMatch.teams.away.name}.
Tu tarea es armar 3 FICHAS COMBINADAS (parlays) que incluyan selecciones de este partido principal y opcionalmente de los "Otros partidos disponibles".

${statsContext}
${otherMatchesContext}

Instrucciones estrictas para las fichas:
IMPORTANTE: SÉ CREATIVO Y ALEATORIO. NO uses siempre los mismos mercados. Variá entre "Ambos Marcan", "Total Goles", "Córners", "Tarjetas", "Jugador a Marcar", etc.
1. Ficha "Conservadora": DEBE tener exactamente 3 selecciones lógicas (ej. Doble oportunidad, Gana Empate).
2. Ficha "Equilibrada": DEBE tener exactamente 4 selecciones (combina victorias con Más de 1.5 goles o córners).
3. Ficha "Alto Riesgo": DEBE tener exactamente 5 selecciones (combina victorias, goles, tarjetas, o gol de un jugador real y específico del equipo, ej. "Gol de Vinícius Jr"). NUNCA uses frases genéricas como "Gol de Delantero", usa nombres de jugadores reales que suelan marcar goles para ese equipo.

Para cada selección (leg), usa el formato:
- title: "Gana ${targetMatch.teams.home.name}" o "Más de 1.5 Goles", etc.
- subtitle: "Equipo Local vs Equipo Visitante"
- date: "Hoy"

Responde ÚNICAMENTE con un JSON válido usando esta estructura exacta:
{
  "reasoning": "Breve explicación de por qué elegiste estas selecciones.",
  "bets": [
    {
      "level": "Conservadora",
      "title": "Ficha Segura",
      "description": "Explicación corta",
      "legs": [
        { "title": "...", "subtitle": "...", "date": "Hoy" },
        { "title": "...", "subtitle": "...", "date": "Hoy" },
        { "title": "...", "subtitle": "...", "date": "Hoy" }
      ]
    },
    ... (Repetir para Equilibrada con 4 legs, y Alto Riesgo con 5 legs)
  ]
}
`;

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1500,
      temperature: 0.9,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const textResponse = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
    
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return await getFallbackPrediction(targetMatch, todaysMatches);
    }
    
    return JSON.parse(jsonMatch[0]) as AIPredictionResult;
    
  } catch (error) {
    console.error("Error generating AI analysis:", error);
    return await getFallbackPrediction(targetMatch, await getTodaysMatches());
  }
}

async function getFallbackPrediction(match: any, todaysMatches: any[]): Promise<AIPredictionResult> {
  const dateStr = new Date(match.fixture.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const t1 = match.teams.home.name;
  const t2 = match.teams.away.name;
  
  const m2 = todaysMatches.length > 0 ? todaysMatches[0] : match;
  const m3 = todaysMatches.length > 1 ? todaysMatches[1] : match;

  return {
    reasoning: `Análisis Estadístico de Contingencia activado por falta de conexión IA.`,
    bets: [
      { 
        level: "Conservadora", 
        title: `Combinada Segura`, 
        description: "Estadísticamente probable",
        legs: [
          { title: `Doble Oportunidad: ${t1} o Empate`, subtitle: `${t1} vs ${t2}`, date: dateStr },
          { title: `Más de 1.5 Goles`, subtitle: `${m2.teams.home.name} vs ${m2.teams.away.name}`, date: "Hoy" },
          { title: `Gana ${m3.teams.home.name} o Empate`, subtitle: `${m3.teams.home.name} vs ${m3.teams.away.name}`, date: "Hoy" }
        ]
      },
      { 
        level: "Equilibrada", 
        title: "Valor Estadístico", 
        description: "Basado en promedios recientes",
        legs: [
          { title: `Ambos Marcan`, subtitle: `${t1} vs ${t2}`, date: dateStr },
          { title: `Más de 8.5 Córners`, subtitle: `${t1} vs ${t2}`, date: dateStr },
          { title: `Gana ${m2.teams.home.name}`, subtitle: `${m2.teams.home.name} vs ${m2.teams.away.name}`, date: "Hoy" },
          { title: `Más de 1.5 Goles`, subtitle: `${m3.teams.home.name} vs ${m3.teams.away.name}`, date: "Hoy" }
        ]
      },
      { 
        level: "Alto Riesgo", 
        title: "Gran Retorno", 
        description: "Condiciones ideales para sorpresas",
        legs: [
          { title: `Gana ${t1} y Ambos Marcan`, subtitle: `${t1} vs ${t2}`, date: dateStr },
          { title: `Gol del "9" de ${t1}`, subtitle: `${t1} vs ${t2}`, date: dateStr },
          { title: `Más de 4.5 Tarjetas Amarillas`, subtitle: `${t1} vs ${t2}`, date: dateStr },
          { title: `Gana ${m2.teams.away.name}`, subtitle: `${m2.teams.home.name} vs ${m2.teams.away.name}`, date: "Hoy" },
          { title: `Gana ${m3.teams.home.name} al Descanso`, subtitle: `${m3.teams.home.name} vs ${m3.teams.away.name}`, date: "Hoy" }
        ]
      }
    ]
  };
}
