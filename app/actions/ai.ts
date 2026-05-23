"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

// Rate limiting state (in-memory map)
// Map of user_id -> Array of timestamps
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_MAX = 5; // max requests
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

export type AIPredictionResult = {
  recommendedBet: string;
  confidence: number;
  odds: string; // Since we don't have real odds for the recommended bet easily, Claude can estimate or we can just return a placeholder. Actually API-Football odds endpoint is separate.
  reasoning: string;
  alternatives: Array<{ title: string; risk: string; odds: string; confidence: number }>;
};

export async function generatePredictionAnalysis(fixtureId: number): Promise<AIPredictionResult | null> {
  const { getMatchById, getH2HStats, getTeamForm } = await import('@/app/actions/football');
  const match = await getMatchById(fixtureId);
  if (!match) return null;

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
    
    // Clean old requests
    const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW_MS);
    
    if (recentRequests.length >= RATE_LIMIT_MAX) {
      console.warn(`Rate limit exceeded for user ${userId}`);
      throw new Error("Rate limit exceeded. Try again later.");
    }
    
    recentRequests.push(now);
    rateLimitMap.set(userId, recentRequests);

    // 2. Prepare the prompt for Claude
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) throw new Error("Missing ANTHROPIC_API_KEY");

    const anthropic = new Anthropic({
      apiKey: anthropicKey,
    });

    // Fetch real stats to feed to the AI
    const h2h = await getH2HStats(match.teams.home.id, match.teams.away.id);
    const homeForm = await getTeamForm(match.teams.home.id);
    const awayForm = await getTeamForm(match.teams.away.id);

    const homeWins = homeForm.filter((f: string) => f === 'W').length;
    const awayWins = awayForm.filter((f: string) => f === 'W').length;
    
    let statsContext = `Estadísticas Reales:
- Forma reciente ${match.teams.home.name} (últimos 5): ${homeWins} Victorias. Forma: [${homeForm.join(',')}]
- Forma reciente ${match.teams.away.name} (últimos 5): ${awayWins} Victorias. Forma: [${awayForm.join(',')}]
`;
    if (h2h && h2h.total > 0) {
      statsContext += `- Historial Directo (H2H): En ${h2h.total} partidos, el Local ganó ${h2h.team1Wins}, el Visitante ganó ${h2h.team2Wins}, y hubo ${h2h.draws} empates.\n`;
    }

    const prompt = `
Eres un analista deportivo experto y tipster profesional. Tu trabajo es analizar el siguiente partido usando las estadísticas reales proveídas y entregar una recomendación de apuesta en formato JSON.

Partido: ${match.teams.home.name} (Local) vs ${match.teams.away.name} (Visitante)
Liga: ${match.league.name}
Fecha: ${new Date(match.fixture.date).toLocaleDateString()}

${statsContext}

Instrucciones:
1. Genera un análisis profundo en español (máximo 40 palabras) explicando tu recomendación basándote estrictamente en la 'Forma' y el 'H2H' dados.
2. Proporciona 1 apuesta principal recomendada (la más segura según las stats).
3. Proporciona 2 apuestas alternativas lógicas y DIVERSAS. NO repitas siempre el mismo tipo de apuesta (varía entre ganador, goles, hándicap, córners simulados, etc).
4. Genera cuotas (odds) realistas y proporcionales a las estadísticas matemáticas. Si un equipo gana siempre, su cuota debe ser baja (ej. 1.20). Si es un partido parejo, las cuotas deben reflejarlo (ej. 2.50).

Debes responder ÚNICAMENTE con un objeto JSON válido usando esta estructura exacta:
{
  "recommendedBet": "Texto corto con la apuesta principal",
  "confidence": número entero del 0 al 100,
  "odds": "texto decimal, ej: 1.85",
  "reasoning": "Párrafo de análisis...",
  "alternatives": [
    { "title": "Apuesta alternativa 1", "risk": "Bajo/Medio/Alto", "odds": "1.70", "confidence": 65 },
    { "title": "Apuesta alternativa 2 (completamente diferente)", "risk": "Bajo/Medio/Alto", "odds": "2.10", "confidence": 45 }
  ]
}
`;

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      temperature: 0.7, // Increased to allow more dynamic alternative bets
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    // Parse the JSON response
    const textResponse = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
    
    // Extract JSON from potential text wrapper
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON object found in Claude response, returning fallback");
      return await getFallbackPrediction(match, getH2HStats, getTeamForm);
    }
    
    return JSON.parse(jsonMatch[0]) as AIPredictionResult;
    
  } catch (error) {
    console.error("Error generating AI analysis:", error);
    return await getFallbackPrediction(match, getH2HStats, getTeamForm);
  }
}

async function getFallbackPrediction(match: any, getH2HStats: any, getTeamForm: any): Promise<AIPredictionResult> {
  const h2h = await getH2HStats(match.teams.home.id, match.teams.away.id);
  const homeForm = await getTeamForm(match.teams.home.id);
  
  let h2hText = h2h && h2h.total > 0 
    ? `Históricamente, ${match.teams.home.name} ha ganado el ${Math.round((h2h.team1Wins/h2h.total)*100)}% de los duelos directos.`
    : `No hay un historial reciente definitivo entre ambos.`;
    
  const homeWins = homeForm.filter((f: string) => f === 'W').length;
  let formText = `El equipo local ha ganado ${homeWins} de sus últimos 5 partidos.`;

  return {
    recommendedBet: `Doble Oportunidad: ${match.teams.home.name} o Empate`,
    confidence: 70,
    odds: "1.45",
    reasoning: `Análisis Estadístico: ${h2hText} ${formText} Basado puramente en métricas y estado de forma reciente (contingencia sin IA), el equipo local tiene una ventaja proyectada.`,
    alternatives: [
      { title: "Más de 1.5 goles", risk: "Bajo", odds: "1.30", confidence: 85 },
      { title: "Empate al descanso", risk: "Medio", odds: "2.10", confidence: 50 }
    ]
  };
}
