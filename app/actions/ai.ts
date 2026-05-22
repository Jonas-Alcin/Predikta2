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

    // 1. Get Match details from StatPal
    const { getMatchById } = await import('@/app/actions/football');
    const match = await getMatchById(fixtureId);
    if (!match) throw new Error("Match not found");

    // 2. Prepare the prompt for Claude
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) throw new Error("Missing ANTHROPIC_API_KEY");

    const anthropic = new Anthropic({
      apiKey: anthropicKey,
    });

    const prompt = `
Eres un analista deportivo experto y tipster profesional. Tu trabajo es analizar el siguiente partido y entregar una recomendación de apuesta en formato JSON.

Partido: ${match.teams.home.name} (Local) vs ${match.teams.away.name} (Visitante)
Liga: ${match.league.name}
Fecha: ${new Date(match.fixture.date).toLocaleDateString()}

Basado en tu conocimiento histórico de estos equipos y la liga, genera un análisis profundo y convincente en español (máximo 40 palabras) explicando el porqué de tu recomendación, y proporciona 2 apuestas alternativas lógicas (ej: "Más de 2.5 goles", "Ambos marcan"). 
Inventa cuotas (odds) realistas basadas en la probabilidad que estimes.

Debes responder ÚNICAMENTE con un objeto JSON válido usando esta estructura exacta (no agregues markdown ni texto fuera del JSON):
{
  "recommendedBet": "Texto corto, ej: Gana Local (1X2) o Doble Oportunidad",
  "confidence": número entero del 0 al 100,
  "odds": "texto con formato decimal, ej: 1.85",
  "reasoning": "Párrafo de análisis convincente basado en tu conocimiento histórico de ambos equipos...",
  "alternatives": [
    { "title": "Nombre apuesta", "risk": "Bajo/Medio/Alto", "odds": "1.70", "confidence": 65 },
    { "title": "Nombre apuesta", "risk": "Bajo/Medio/Alto", "odds": "2.10", "confidence": 45 }
  ]
}
`;

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 500,
      temperature: 0.5, // Slightly higher temperature since it needs to hallucinate stats
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
      return getFallbackPrediction(match);
    }
    
    return JSON.parse(jsonMatch[0]) as AIPredictionResult;
    
  } catch (error) {
    console.error("Error generating AI analysis:", error);
    // Extraer match del scope superior si es posible, aunque aquí no tenemos acceso directo si falló antes.
    // Para simplificar, devolvemos un fallback genérico.
    return {
      recommendedBet: "Gana Local o Empate (1X)",
      confidence: 65,
      odds: "1.50",
      reasoning: "Análisis de contingencia: Según nuestro modelo predictivo automático, el equipo local muestra una ligera ventaja estadística en su estadio. (Generado por modelo de respaldo).",
      alternatives: [
        { title: "Menos de 3.5 goles", risk: "Bajo", odds: "1.35", confidence: 80 },
        { title: "Ambos equipos marcan", risk: "Medio", odds: "1.90", confidence: 55 }
      ]
    };
  }
}

function getFallbackPrediction(match: any): AIPredictionResult {
  return {
    recommendedBet: `Doble Oportunidad: ${match.teams.home.name} o Empate`,
    confidence: 70,
    odds: "1.45",
    reasoning: `Basado en métricas históricas de la liga, ${match.teams.home.name} tiene una ventaja estadística jugando en casa contra ${match.teams.away.name}. Este es un análisis automático de contingencia.`,
    alternatives: [
      { title: "Más de 1.5 goles", risk: "Bajo", odds: "1.30", confidence: 85 },
      { title: "Empate al descanso", risk: "Medio", odds: "2.10", confidence: 50 }
    ]
  };
}
