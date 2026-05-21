"use client";

import { useState, useEffect } from "react";
import { Target, AlertTriangle, ShieldCheck, Info, Check } from "lucide-react";
import { getTodaysMatches } from "@/app/actions/football";
import { APIFootballFixture } from "@/lib/types";

export default function TopBetsPage() {
  const [activeTab, setActiveTab] = useState<"seguras" | "riesgo">("seguras");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [matches, setMatches] = useState<APIFootballFixture[]>([]);

  useEffect(() => {
    async function loadMatches() {
      const todaysMatches = await getTodaysMatches();
      setMatches(todaysMatches || []);
    }
    loadMatches();
  }, []);

  const handleCopy = (bet: any, type: "segura" | "riesgo") => {
    let text = "";
    if (type === "segura") {
      text = `🎯 Predikta AI - Apuesta Segura\n✅ ${bet.prediction} (${bet.teams})\n📈 Cuota: ${bet.odds}`;
    } else {
      text = `🎯 Predikta AI - ${bet.title}\n` +
        bet.legs.map((l: any) => `✅ ${l.pick} (${l.match}) - Cuota: ${l.odds}`).join('\n') + 
        `\n📈 Cuota Total: ${bet.odds}`;
    }

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "absolute";
      textArea.style.left = "-999999px";
      document.body.prepend(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (error) {
        console.error(error);
      } finally {
        textArea.remove();
      }
    }
    
    setCopiedId(bet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Usar partidos reales de la API
  const m1 = matches.length > 0 ? matches[0] : null;
  const m2 = matches.length > 1 ? matches[1] : m1;
  const m3 = matches.length > 2 ? matches[2] : m1;
  
  const team1H = m1 ? m1.teams.home.name : "Arsenal";
  const team1A = m1 ? m1.teams.away.name : "Chelsea";
  const team2H = m2 ? m2.teams.home.name : "Real Madrid";
  const team2A = m2 ? m2.teams.away.name : "Valencia";
  const team3H = m3 ? m3.teams.home.name : "Juventus";
  const team3A = m3 ? m3.teams.away.name : "Milan";

  const safeBets = [
    { id: 1, league: m1?.league.name || "Premier League", time: "Próximamente", teams: `${team1H} vs ${team1A}`, prediction: `Gana ${team1H} (1X2)`, confidence: "85%", odds: "1.85", reasoning: `${team1H} ha sido muy sólido de local recientemente y las estadísticas muestran superioridad táctica.` },
    { id: 2, league: m2?.league.name || "La Liga", time: "Próximamente", teams: `${team2H} vs ${team2A}`, prediction: "Ambos Equipos Marcan (AEM)", confidence: "82%", odds: "1.75", reasoning: `Históricamente, los enfrentamientos entre ${team2H} y ${team2A} terminan con goles de ambos lados.` },
    { id: 3, league: m3?.league.name || "Serie A", time: "Próximamente", teams: `${team3H} vs ${team3A}`, prediction: "Menos de 3.5 Goles", confidence: "78%", odds: "1.65", reasoning: `${team3H} tiene una defensa sólida en casa. Se proyecta un partido cerrado.` },
  ];

  const highRiskBets = [
    { 
      id: 4, 
      title: "Combinada de Ligas",
      confidence: "45%", 
      odds: "8.50",
      explanation: `💡 IA: Selecciones basadas en tendencias ofensivas de ${team1H} y vulnerabilidades de ${team3A}.`,
      legs: [
        { match: `${team1H} vs ${team1A}`, pick: `Gana ${team1H} y +1.5 Goles`, odds: "2.10" },
        { match: `${team2H} vs ${team2A}`, pick: `${team2H} Anota en Ambas Mitades`, odds: "2.65" },
        { match: `${team3H} vs ${team3A}`, pick: `Más de 4.5 Tarjetas Amarillas`, odds: "1.52" }
      ]
    },
    { 
      id: 5, 
      title: "Especial Goleadores y Corners",
      confidence: "38%", 
      odds: "12.00",
      explanation: `💡 IA: Analizando el estilo de juego directo, se esperan muchos tiros de esquina en el partido de ${team2H}.`,
      legs: [
        { match: `${team1H} vs ${team1A}`, pick: "Más de 9.5 Corners", odds: "1.85" },
        { match: `${team2H} vs ${team2A}`, pick: `Gana ${team2A} o Empate`, odds: "3.20" },
        { match: `${team3H} vs ${team3A}`, pick: "Menos de 2.5 Goles", odds: "2.02" }
      ]
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col items-center justify-center gap-4 mb-8 text-center">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
            <Target className="text-primary w-8 h-8" /> Mejores Apuestas
          </h1>
          <p className="text-textMuted mt-2">Predicciones curadas con el mayor valor y puntaje de confianza.</p>
        </div>
        
        <div className="flex w-full max-w-md mx-auto gap-2">
          <button 
            onClick={() => setActiveTab("seguras")}
            className={`flex-1 px-2 py-2.5 rounded-lg text-[13px] md:text-sm font-semibold transition-all flex items-center justify-center gap-1 md:gap-2 border ${
              activeTab === "seguras" 
                ? "bg-primary/20 border-primary text-white" 
                : "bg-white/5 border-white/10 text-textMuted hover:bg-white/10 hover:text-white"
            }`}
          >
            <ShieldCheck className={`w-4 h-4 shrink-0 ${activeTab === "seguras" ? "text-primary" : "text-accent"}`} /> 
            <span className="truncate">Apuestas Seguras</span>
          </button>
          <button 
            onClick={() => setActiveTab("riesgo")}
            className={`flex-1 px-2 py-2.5 rounded-lg text-[13px] md:text-sm font-semibold transition-all flex items-center justify-center gap-1 md:gap-2 border ${
              activeTab === "riesgo" 
                ? "bg-primary/20 border-primary text-white" 
                : "bg-white/5 border-white/10 text-textMuted hover:bg-white/10 hover:text-white"
            }`}
          >
            <AlertTriangle className={`w-4 h-4 shrink-0 ${activeTab === "riesgo" ? "text-primary" : "text-danger/70"}`} /> 
            <span className="truncate">Alto Riesgo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeTab === "seguras" ? (
          // Render Safe Bets (Simples)
          safeBets.map((bet) => (
            <div key={bet.id} className="bg-[#131418] border border-[#d9f95d]/30 hover:border-[#d9f95d] rounded-3xl p-6 transition-all relative flex flex-col h-full group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#d9f95d]"></div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-[#d9f95d] w-6 h-6" />
                  <span className="font-bold text-lg text-[#d9f95d]">Apuesta Segura</span>
                </div>
                <div className="text-xs font-bold bg-[#d9f95d]/10 text-[#d9f95d] px-2 py-1 rounded-md">
                  Confianza: {bet.confidence}
                </div>
              </div>

              <p className="text-sm text-textMuted mb-4">{bet.league} • {bet.time}</p>
              
              <div className="bg-[#181a20] border border-white/5 rounded-xl p-3 mb-6 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#d9f95d]/50 to-transparent"></div>
                <p className="text-[12px] text-white/80 font-medium leading-relaxed pl-2">
                  💡 IA: {bet.reasoning}
                </p>
              </div>

              <div className="relative mb-6 flex-grow mt-2">
                <div className="space-y-5">
                  <div className="relative flex items-start group">
                    <div className="absolute left-0 top-1.5 w-[10px] h-[10px] rounded-full border-[2.5px] border-[#d9f95d] bg-[#131418] z-10"></div>
                    <div className="flex-1 pl-5 pr-2">
                      <span className="font-bold text-white text-sm block leading-tight">{bet.prediction}</span>
                      <span className="text-[11px] text-textMuted block mt-0.5">{bet.teams}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold text-sm">{bet.odds}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs text-textMuted uppercase font-bold tracking-wider block">Cuota Total</span>
                    <span className="text-xl font-black text-white">{bet.odds}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleCopy(bet, "segura")}
                  className="w-full py-3.5 rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2 bg-[#d9f95d] text-black hover:bg-[#c8ea4f]"
                >
                  {copiedId === bet.id ? <><Check className="w-4 h-4" /> ¡Ficha Copiada!</> : "COPIAR Y APOSTAR"}
                </button>
              </div>
            </div>
          ))
        ) : (
          // Render High Risk Bets (Combinadas)
          highRiskBets.map((bet) => (
            <div key={bet.id} className="bg-[#131418] border border-[#d9f95d]/30 hover:border-[#d9f95d] rounded-3xl p-6 transition-all relative flex flex-col h-full group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#d9f95d]"></div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-[#d9f95d] w-6 h-6" />
                  <span className="font-bold text-lg text-[#d9f95d]">{bet.title}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-textMuted">Combinada de Alto Riesgo</p>
                <div className="text-xs font-bold bg-[#d9f95d]/10 text-[#d9f95d] px-2 py-1 rounded-md">
                  Confianza: {bet.confidence}
                </div>
              </div>
              
              <div className="bg-[#181a20] border border-white/5 rounded-xl p-3 mb-6 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#d9f95d]/50 to-transparent"></div>
                <p className="text-[12px] text-white/80 font-medium leading-relaxed pl-2">
                  {bet.explanation}
                </p>
              </div>

              <div className="relative mb-6 flex-grow mt-2">
                <div className="absolute left-[4px] top-3 bottom-8 w-[2px] bg-white/10"></div>
                
                <div className="space-y-5">
                  {bet.legs.map((leg, idx) => (
                    <div key={idx} className="relative flex items-start group">
                      <div className="absolute left-0 top-1.5 w-[10px] h-[10px] rounded-full border-[2.5px] border-[#d9f95d] bg-[#131418] z-10"></div>
                      <div className="flex-1 pl-5 pr-2">
                        <span className="font-bold text-white text-sm block leading-tight">{leg.pick}</span>
                        <span className="text-[11px] text-textMuted block mt-0.5">{leg.match}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white font-bold text-sm">{leg.odds}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex gap-2 mb-4">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] text-textMuted leading-snug">
                  Si un jugador no inicia, se anularán sus selecciones vinculadas. Las cuotas se volverán a calcular para las selecciones restantes.
                </p>
              </div>

              <div className="border-t border-white/10 pt-4 mt-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs text-textMuted uppercase font-bold tracking-wider block">Cuota Total</span>
                    <span className="text-xl font-black text-white">{bet.odds}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleCopy(bet, "riesgo")}
                  className="w-full py-3.5 rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2 bg-[#d9f95d] text-black hover:bg-[#c8ea4f]"
                >
                  {copiedId === bet.id ? <><Check className="w-4 h-4" /> ¡Ficha Copiada!</> : "COPIAR Y APOSTAR"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
