"use client";

import { ArrowLeft, ShieldCheck, Zap, Info, Check, Flame, AlertTriangle, X, Plus, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getMatchById } from "@/app/actions/football";
import { generatePredictionAnalysis, type AIPredictionResult, type AILeg } from "@/app/actions/ai";
import { getAdditionalLeg } from "@/app/actions/ai_edit";
import { logAnalysis } from "@/app/actions/db";
import { APIFootballFixture } from "@/lib/types";

export default function PredictionDetailPage({ params }: { params: { matchId: string } }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [match, setMatch] = useState<APIFootballFixture | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [aiAnalysis, setAiAnalysis] = useState<AIPredictionResult | null>(null);
  const [analyzing, setAnalyzing] = useState(true);
  const [addingLegTo, setAddingLegTo] = useState<number | null>(null);

  useEffect(() => {
    async function loadMatch() {
      const data = await getMatchById(Number(params.matchId));
      setMatch(data);
      setLoading(false);
      
      if (data) {
        const isFinished = ["FT", "AET", "PEN", "PST", "CANC", "ABD"].includes(data.fixture.status.short);
        
        if (!isFinished) {
          const analysis = await generatePredictionAnalysis(Number(params.matchId));
          setAiAnalysis(analysis);
          setAnalyzing(false);

          if (analysis) {
            await logAnalysis({
              fixture_id: data.fixture.id,
              league_name: data.league.name,
              team_home: data.teams.home.name,
              team_away: data.teams.away.name,
              match_date: data.fixture.date,
              analysis_summary: analysis.reasoning,
            });
          }
        } else {
          setAnalyzing(false);
        }
      } else {
        setAnalyzing(false);
      }
    }
    loadMatch();
  }, [params.matchId]);

  const handleRemoveLeg = (betIndex: number, legIndex: number) => {
    if (!aiAnalysis) return;
    const newAnalysis = { ...aiAnalysis };
    newAnalysis.bets[betIndex].legs = newAnalysis.bets[betIndex].legs.filter((_, idx) => idx !== legIndex);
    setAiAnalysis(newAnalysis);
  };

  const handleAddLeg = async (betIndex: number) => {
    if (!aiAnalysis || !match) return;
    setAddingLegTo(betIndex);
    
    try {
      const bet = aiAnalysis.bets[betIndex];
      const newLeg = await getAdditionalLeg(match.fixture.id, bet.level, bet.legs);
      
      if (newLeg) {
        const newAnalysis = { ...aiAnalysis };
        newAnalysis.bets[betIndex].legs.push(newLeg);
        setAiAnalysis(newAnalysis);
      }
    } catch (error) {
      console.error("Failed to add leg", error);
    } finally {
      setAddingLegTo(null);
    }
  };

  const handleBetAction = (bet: any, id: string, url: string) => {
    if (bet.legs.length === 0) {
      alert("No puedes copiar una ficha vacía.");
      return;
    }
    const text = `🎯 Predikta AI - Ficha ${bet.level}\n` +
      bet.legs.map((l: any) => `✅ ${l.title} (${l.subtitle})`).join('\n');

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
      } catch (error) {} finally {
        textArea.remove();
      }
    }
    
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    window.open(url, '_blank');
  };

  const getIconForLevel = (level: string) => {
    if (level === "Conservadora") return ShieldCheck;
    if (level === "Equilibrada") return Flame;
    return AlertTriangle;
  };

  if (loading) {
    return <div className="text-white/50 text-center py-20 animate-pulse">Cargando análisis de IA para este partido...</div>;
  }

  if (!match) {
    return <div className="text-white/50 text-center py-20">No se encontró información del partido.</div>;
  }

  const isLive = ["1H", "2H", "HT", "LIVE"].includes(match.fixture.status.short);
  const timeStr = new Date(match.fixture.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/matches" className="p-2 rounded-full hover:bg-white/10 text-textMuted hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-sm font-medium text-textMuted">Detalles del Partido y Análisis de IA</span>
      </div>

      <div className="glass-panel border border-border rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d9f95d]/10 rounded-full mix-blend-multiply filter blur-[80px]"></div>
        
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-textMuted mb-4 tracking-widest uppercase">
            {match.league.name}
          </span>
          <div className="flex justify-center items-start gap-2 sm:gap-6 md:gap-12">
            <div className="flex flex-col items-center flex-1 w-0">
               <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-[#131418] border-4 border-white/5 object-contain p-2 shadow-2xl" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center mt-4 leading-tight">{match.teams.home.name}</h2>
              <span className="text-xs sm:text-sm text-textMuted mt-1">Local</span>
            </div>
            
            <div className="flex flex-col items-center shrink-0 pt-2 sm:pt-4 md:pt-6">
              <div className={`font-black text-white tracking-widest mb-2 whitespace-nowrap text-center ${(isLive || match.fixture.status.short === 'FT') ? 'text-3xl sm:text-4xl md:text-5xl' : 'text-xl sm:text-2xl md:text-3xl'}`}>
                 {(isLive || match.fixture.status.short === 'FT') ? `${match.goals.home ?? 0} - ${match.goals.away ?? 0}` : timeStr}
              </div>
              <span className={`font-bold text-xs sm:text-sm whitespace-nowrap ${isLive ? 'text-[#d9f95d] animate-pulse' : 'text-textMuted'}`}>
                 {isLive ? `EN VIVO ${match.fixture.status.elapsed ? match.fixture.status.elapsed + "'" : ''}` : match.fixture.status.short === 'NS' ? 'Próximamente' : match.fixture.status.short === 'FT' ? 'Finalizado' : match.fixture.status.short}
              </span>
            </div>

            <div className="flex flex-col items-center flex-1 w-0">
              <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-[#131418] border-4 border-white/5 object-contain p-2 shadow-2xl" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center mt-4 leading-tight">{match.teams.away.name}</h2>
              <span className="text-xs sm:text-sm text-textMuted mt-1">Visitante</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
         <div className="flex items-center gap-3 mb-2 px-2">
           <h3 className="text-2xl font-bold text-white flex items-center gap-2">
             <Zap className="text-[#d9f95d] w-6 h-6" /> Predicciones de Alta Probabilidad
           </h3>
         </div>
         <p className="text-textMuted px-2 mb-6">Combinadas estratégicas calculadas mediante algoritmos estadísticos avanzados. Puedes editar las fichas según tu preferencia.</p>

         {analyzing ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-[#131418] border border-white/5 rounded-3xl animate-pulse"></div>
              <div className="h-64 bg-[#131418] border border-white/5 rounded-3xl animate-pulse"></div>
              <div className="h-64 bg-[#131418] border border-white/5 rounded-3xl animate-pulse"></div>
            </div>
         ) : aiAnalysis ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {aiAnalysis.bets.map((bet, betIndex) => {
                const Icon = getIconForLevel(bet.level);
                const id = `bet-${betIndex}`;
                const isAdding = addingLegTo === betIndex;
                return (
                  <div key={betIndex} className="bg-[#f0f2f5] rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full border border-gray-200">
                    {/* Cabecera Oscura */}
                    <div className="bg-[#2d2f3a] text-white p-4 flex items-center justify-between relative overflow-hidden">
                      <div className="flex items-center gap-2 relative z-10">
                        <Icon className="text-white w-5 h-5" />
                        <span className="font-bold text-lg">{bet.level}</span>
                      </div>
                      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#b5d33a] to-[#d9f95d] transform skew-x-12 translate-x-4 flex items-center justify-center">
                         <span className="skew-x-[-12deg] font-black text-sm text-black">IA Pick</span>
                      </div>
                    </div>

                    {/* Notificación de Confianza */}
                    <div className="bg-[#f4fbdf] border-b border-[#d9f95d]/30 px-4 py-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-[#799900]" />
                      <span className="text-xs font-bold text-[#799900]">Alta confianza estadística</span>
                    </div>

                    {/* Lista de Partidos */}
                    <div className="p-4 space-y-3 flex-grow bg-white">
                      {bet.legs.map((leg: any, idx: number) => (
                        <div key={idx} className="relative group">
                          <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-3 border border-transparent group-hover:border-gray-200 transition-colors">
                            <div className="flex-1">
                              <div className="font-bold text-gray-900 text-sm leading-tight mb-1">{leg.title}</div>
                              <div className="text-xs text-gray-600 mb-0.5">{leg.subtitle}</div>
                              <div className="text-[11px] text-gray-500">{leg.date}</div>
                            </div>
                            <button 
                              onClick={() => handleRemoveLeg(betIndex, idx)}
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                              title="Quitar de la ficha"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Botón Agregar */}
                      <div className="pt-2">
                        <button 
                          onClick={() => handleAddLeg(betIndex)}
                          disabled={isAdding}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-bold text-xs hover:border-[#d9f95d] hover:text-[#799900] hover:bg-[#f4fbdf] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isAdding ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Analizando...</>
                          ) : (
                            <><Plus className="w-4 h-4" /> Agregar Selección IA</>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Footer con Casas de Apuestas */}
                    <div className="bg-gray-50 p-4 border-t border-gray-200 mt-auto">
                      <p className="text-center text-xs text-gray-500 font-bold mb-3 uppercase tracking-wider">Apostar esta ficha en:</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleBetAction(bet, id, 'https://www.betano.com')} disabled={bet.legs.length === 0} className="flex-1 py-2 rounded-lg text-xs font-bold transition-colors bg-[#ff6b00] text-white hover:bg-[#e56000] border border-[#d65a00] shadow-sm disabled:opacity-50">
                          Betano
                        </button>
                        <button onClick={() => handleBetAction(bet, id, 'https://1xbet.com')} disabled={bet.legs.length === 0} className="flex-1 py-2 rounded-lg text-xs font-bold transition-colors bg-[#1e2329] text-white hover:bg-[#121518] border border-gray-900 shadow-sm disabled:opacity-50">
                          1xBet
                        </button>
                        <button onClick={() => handleBetAction(bet, id, 'https://jugabet.cl')} disabled={bet.legs.length === 0} className="flex-1 py-2 rounded-lg text-xs font-bold transition-colors bg-[#ffffff] text-[#001d4a] hover:bg-gray-100 border border-[#001d4a] shadow-sm disabled:opacity-50">
                          JugaBet
                        </button>
                      </div>
                      {copiedId === id && (
                        <div className="mt-3 text-center text-xs font-bold text-green-600 flex items-center justify-center gap-1">
                          <Check className="w-3 h-3" /> Ficha y selecciones copiadas
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
         ) : (
            <div className="bg-[#131418] border border-white/5 rounded-2xl p-6 text-textMuted font-medium flex items-center gap-2">
              <Info className="w-5 h-5" />
              {["FT", "AET", "PEN", "PST", "CANC", "ABD"].includes(match.fixture.status.short) 
                ? "Partido Finalizado. Las apuestas están cerradas." 
                : "Error al generar análisis de IA"}
            </div>
         )}
      </div>
    </div>
  );
}
