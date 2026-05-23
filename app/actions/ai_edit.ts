"use server";

import Anthropic from "@anthropic-ai/sdk";
import { getTodaysMatches, getMatchById } from '@/app/actions/football';
import { AILeg } from "./ai";

export async function getAdditionalLeg(fixtureId: number, level: string, existingLegs: AILeg[]): Promise<AILeg | null> {
  const targetMatch = await getMatchById(fixtureId);
  if (!targetMatch) return null;

  try {
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    if (!anthropicKey) throw new Error("Missing ANTHROPIC_API_KEY");

    const anthropic = new Anthropic({
      apiKey: anthropicKey,
    });

    const existingTitles = existingLegs.map(l => l.title).join(", ");

    const prompt = `
Eres un analista deportivo experto. El usuario está armando una ficha combinada (Bet Builder) para el partido ${targetMatch.teams.home.name} vs ${targetMatch.teams.away.name} de nivel "${level}".
Actualmente tiene las siguientes selecciones (legs) en su ficha:
[${existingTitles}]

Instrucciones:
Proporciona EXACTAMENTE UNA NUEVA selección (leg) para agregar a esta ficha.
CRÍTICO: La nueva selección DEBE ser diferente a las que ya tiene. Sé original y aleatorio (usa córners, tarjetas, marcador exacto, goleadores reales, etc).
Si usas goleadores, usa NOMBRES REALES de jugadores, no "Delantero".

Responde ÚNICAMENTE con un JSON válido usando esta estructura exacta:
{
  "title": "Gana X",
  "subtitle": "Equipo Local vs Equipo Visitante",
  "date": "Hoy"
}
`;

    const msg = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
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
      return getFallbackLeg(targetMatch, existingLegs);
    }
    
    return JSON.parse(jsonMatch[0]) as AILeg;
    
  } catch (error) {
    console.error("Error generating additional leg:", error);
    return getFallbackLeg(targetMatch, existingLegs);
  }
}

function getFallbackLeg(match: any, existing: AILeg[]): AILeg {
  const options = [
    { title: `Más de 8.5 Córners`, subtitle: `${match.teams.home.name} vs ${match.teams.away.name}` },
    { title: `Ambos Marcan`, subtitle: `${match.teams.home.name} vs ${match.teams.away.name}` },
    { title: `Más de 4.5 Tarjetas Amarillas`, subtitle: `${match.teams.home.name} vs ${match.teams.away.name}` },
    { title: `Gol del Goleador de ${match.teams.home.name}`, subtitle: `${match.teams.home.name} vs ${match.teams.away.name}` },
    { title: `Doble Oportunidad: Local o Empate`, subtitle: `${match.teams.home.name} vs ${match.teams.away.name}` },
    { title: `Menos de 3.5 Goles Totales`, subtitle: `${match.teams.home.name} vs ${match.teams.away.name}` }
  ];

  const existingTitles = existing.map(e => e.title);
  const available = options.filter(o => !existingTitles.includes(o.title));
  
  if (available.length > 0) {
    const random = available[Math.floor(Math.random() * available.length)];
    return { ...random, date: "Hoy" };
  }
  
  return { title: `Gol Especial Aleatorio`, subtitle: `${match.teams.home.name} vs ${match.teams.away.name}`, date: "Hoy" };
}
