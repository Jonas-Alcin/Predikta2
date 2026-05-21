"use client";

import { useState } from "react";
import { Target, AlertTriangle, ShieldCheck, Info, Check } from "lucide-react";

export default function TopBetsPage() {
  const [activeTab, setActiveTab] = useState<"seguras" | "riesgo">("seguras");
  const [copiedId, setCopiedId] = useState<number | null>(null);

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

  const safeBets = [
    { id: 1, league: "Premier League", time: "Hoy, 15:00", teams: "Arsenal vs Chelsea", prediction: "Gana Arsenal (1X2)", confidence: "85%", odds: "1.85", reasoning: "Arsenal ha ganado sus últimos 5 partidos como local, mientras que Chelsea promedia 1.8 goles en contra como visitante." },
    { id: 2, league: "La Liga", time: "Hoy, 21:00", teams: "Real Madrid vs Valencia", prediction: "Ambos Equipos Marcan (AEM)", confidence: "82%", odds: "1.75", reasoning: "Históricamente, el 80% de sus enfrentamientos en el Bernabéu terminan con goles de ambos lados. Valencia ha anotado en 9 de sus últimos 10 juegos." },
    { id: 3, league: "Serie A", time: "Mañana, 15:00", teams: "Juventus vs AC Milan", prediction: "Menos de 2.5 Goles", confidence: "78%", odds: "1.65", reasoning: "Juventus solo ha recibido 4 goles en casa esta temporada. Sus últimos 3 duelos directos tuvieron un promedio de 1.2 goles totales." },
  ];

  const highRiskBets = [
    { 
      id: 4, 
      title: "Combinada Premier League",
      confidence: "45%", 
      odds: "8.50",
      explanation: "💡 IA: Selecciones basadas en tendencias de tiros de esquina (H2H) y debilidades defensivas del Chelsea en las bandas. El árbitro del Spurs-Utd promedia más de 5 tarjetas por juego.",
      legs: [
        { match: "Man City vs Liverpool", pick: "Más de 9.5 Corners", odds: "1.65" },
        { match: "Arsenal vs Chelsea", pick: "Saka > 1.5 Tiros a Puerta", odds: "2.10" },
        { match: "Tottenham vs Man Utd", pick: "Más de 4.5 Tarjetas Amarillas", odds: "2.45" }
      ]
    },
    { 
      id: 5, 
      title: "Especial La Liga",
      confidence: "38%", 
      odds: "12.00",
      explanation: "💡 IA: Vinicius Jr. mantiene una racha goleadora en el Bernabéu. El Sevilla muestra una defensa adelantada ideal para el estilo del Barça. Atleti y Betis juegan partidos muy cerrados en el medio campo.",
      legs: [
        { match: "Real Madrid vs Valencia", pick: "Vinicius Jr. Anota", odds: "2.30" },
        { match: "Barcelona vs Sevilla", pick: "Gana Barça y +2.5 Goles", odds: "2.80" },
        { match: "Atleti vs Betis", pick: "Menos de 8.5 Corners", odds: "1.85" }
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
