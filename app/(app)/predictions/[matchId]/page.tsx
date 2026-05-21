"use client";

import { ArrowLeft, ShieldCheck, Zap, Activity, Info, Check, Bookmark, BookmarkCheck } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getMatchById } from "@/app/actions/football";
import { generatePredictionAnalysis, type AIPredictionResult } from "@/app/actions/ai";
import { saveBet, removeSavedBet, isBetSaved, logAnalysis } from "@/app/actions/db";
import { APIFootballFixture } from "@/lib/types";

export default function PredictionDetailPage({ params }: { params: { matchId: string } }) {
  const [copied, setCopied] = useState(false);
  const [match, setMatch] = useState<APIFootballFixture | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [aiAnalysis, setAiAnalysis] = useState<AIPredictionResult | null>(null);
  const [analyzing, setAnalyzing] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadMatch() {
      const data = await getMatchById(Number(params.matchId));
      setMatch(data);
      setLoading(false);
      
      if (data) {
        const savedStatus = await isBetSaved(Number(params.matchId));
        setSaved(savedStatus);

        const analysis = await generatePredictionAnalysis(Number(params.matchId));
        setAiAnalysis(analysis);
        setAnalyzing(false);

        // Registrar en el historial
        await logAnalysis({
          fixture_id: data.fixture.id,
          league_name: data.league.name,
          team_home: data.teams.home.name,
          team_away: data.teams.away.name,
          match_date: data.fixture.date,
          analysis_summary: analysis.reasoning,
        });
      } else {
        setAnalyzing(false);
      }
    }
    loadMatch();
  }, [params.matchId]);

  const handleCopy = () => {
    const text = `🎯 Predikta AI - Apuesta Recomendada\n✅ ${aiAnalysis?.recommendedBet || ''} (${match?.teams.home.name} vs ${match?.teams.away.name})\n📈 Mejores Cuotas: ${aiAnalysis?.odds || '1.85'}`;

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
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSave = async () => {
    if (!match || !aiAnalysis) return;
    if (saved) {
      setSaved(false);
      await removeSavedBet(match.fixture.id);
    } else {
      setSaved(true);
      await saveBet({
        fixture_id: match.fixture.id,
        league_name: match.league.name,
        team_home: match.teams.home.name,
        team_away: match.teams.away.name,
        match_date: match.fixture.date,
        bet_type: "Apuesta Recomendada",
        prediction_text: aiAnalysis.recommendedBet,
        odds: aiAnalysis.odds
      });
    }
  };

  if (loading) {
    return <div className="text-white/50 text-center py-20 animate-pulse">Cargando análisis de IA para este partido...</div>;
  }

  if (!match) {
    return <div className="text-white/50 text-center py-20">No se encontró información del partido.</div>;
  }

  const isLive = ["1H", "2H", "HT"].includes(match.fixture.status.short);
  const timeStr = new Date(match.fixture.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header / Back */}
      <div className="flex items-center gap-4 mb-4">
        <Link href="/matches" className="p-2 rounded-full hover:bg-white/10 text-textMuted hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="text-sm font-medium text-textMuted">Detalles del Partido y Análisis de IA</span>
      </div>

      {/* Match Scoreboard Hero */}
      <div className="glass-panel border border-border rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full mix-blend-multiply filter blur-[80px]"></div>
        
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-textMuted mb-4 tracking-widest uppercase">
            {match.league.name}
          </span>
          <div className="flex justify-center items-start gap-2 sm:gap-6 md:gap-12">
            <div className="flex flex-col items-center flex-1 w-0">
               <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-surface border-4 border-white/5 object-contain p-2 shadow-2xl" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center mt-4 leading-tight">{match.teams.home.name}</h2>
              <span className="text-xs sm:text-sm text-textMuted mt-1">Local</span>
            </div>
            
            <div className="flex flex-col items-center shrink-0 pt-2 sm:pt-4 md:pt-6">
              <div className={`font-black text-white tracking-widest mb-2 whitespace-nowrap text-center ${(isLive || match.fixture.status.short === 'FT') ? 'text-3xl sm:text-4xl md:text-5xl' : 'text-xl sm:text-2xl md:text-3xl'}`}>
                 {(isLive || match.fixture.status.short === 'FT') ? `${match.goals.home ?? 0} - ${match.goals.away ?? 0}` : timeStr}
              </div>
              <span className={`font-bold text-xs sm:text-sm whitespace-nowrap ${isLive ? 'text-[#d9f95d] animate-pulse' : 'text-textMuted'}`}>
                 {isLive ? `EN VIVO ${match.fixture.status.elapsed}'` : match.fixture.status.short}
              </span>
            </div>

            <div className="flex flex-col items-center flex-1 w-0">
              <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-surface border-4 border-white/5 object-contain p-2 shadow-2xl" />
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center mt-4 leading-tight">{match.teams.away.name}</h2>
              <span className="text-xs sm:text-sm text-textMuted mt-1">Visitante</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Main Prediction */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel border border-border rounded-2xl p-6 relative overflow-hidden">
             <div className="absolute left-0 top-0 w-1 h-full bg-primary"></div>
             <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Zap className="text-primary w-6 h-6" /> Mejor Predicción de IA
                    </h3>
                    <button onClick={toggleSave} disabled={analyzing} className="p-2 rounded-full hover:bg-white/10 transition-colors" title={saved ? "Quitar de Guardados" : "Guardar Apuesta"}>
                      {saved ? <BookmarkCheck className="w-5 h-5 text-primary" /> : <Bookmark className="w-5 h-5 text-textMuted hover:text-white" />}
                    </button>
                  </div>
                  <p className="text-textMuted">Basado en más de 10,000 puntos de datos y el historial H2H</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm text-textMuted mb-1">Puntaje de Confianza</div>
                  <div className="text-3xl font-black text-accent">
                    {analyzing ? (
                      <div className="w-16 h-8 bg-white/10 rounded animate-pulse"></div>
                    ) : (
                      `${aiAnalysis?.confidence}%`
                    )}
                  </div>
                </div>
             </div>

             <div className="bg-surface border border-primary/20 rounded-xl p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 min-h-[100px]">
                {analyzing ? (
                   <div className="animate-pulse flex space-x-4 w-full">
                     <div className="flex-1 space-y-4 py-1">
                       <div className="h-4 bg-white/10 rounded w-3/4"></div>
                       <div className="h-4 bg-white/10 rounded w-1/2"></div>
                     </div>
                   </div>
                ) : aiAnalysis ? (
                  <>
                    <div>
                      <div className="text-sm text-textMuted mb-1">Apuesta Recomendada</div>
                      <div className="text-xl font-bold text-primary">{aiAnalysis.recommendedBet}</div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <div>
                        <div className="text-sm text-textMuted mb-1">Mejores Cuotas</div>
                        <div className="text-xl font-bold text-white">{aiAnalysis.odds}</div>
                      </div>
                      <button 
                        onClick={handleCopy}
                        className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2"
                      >
                        {copied ? <><Check className="w-4 h-4" /> Copiado</> : "Copiar Apuesta"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-textMuted">Error al generar análisis de IA</div>
                )}
             </div>

             <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-textMuted" /> Razonamiento de IA
                </h4>
                {analyzing ? (
                  <div className="animate-pulse space-y-2 mb-4">
                    <div className="h-3 bg-white/10 rounded"></div>
                    <div className="h-3 bg-white/10 rounded w-5/6"></div>
                    <div className="h-3 bg-white/10 rounded w-4/6"></div>
                  </div>
                ) : (
                  <p className="text-textMuted text-sm leading-relaxed mb-4">
                    {aiAnalysis?.reasoning}
                  </p>
                )}
             </div>
          </div>

          {/* Form and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel border border-border rounded-2xl p-6">
               <h4 className="text-white font-semibold mb-4">Forma Reciente</h4>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-textMuted">{match.teams.home.name}</span>
                    <div className="flex gap-1">
                      {['W','W','W','D','W'].map((r, i) => (
                        <span key={i} className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${r === 'W' ? 'bg-accent/20 text-accent' : r === 'D' ? 'bg-white/10 text-textMuted' : 'bg-danger/20 text-danger'}`}>{r}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-textMuted">{match.teams.away.name}</span>
                    <div className="flex gap-1">
                      {['L','D','L','W','L'].map((r, i) => (
                        <span key={i} className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${r === 'W' ? 'bg-accent/20 text-accent' : r === 'D' ? 'bg-white/10 text-textMuted' : 'bg-danger/20 text-danger'}`}>{r}</span>
                      ))}
                    </div>
                  </div>
               </div>
            </div>

            <div className="glass-panel border border-border rounded-2xl p-6">
               <h4 className="text-white font-semibold mb-4">Estadísticas H2H</h4>
               <div className="space-y-3">
                 <div className="flex justify-between text-sm">
                   <span className="text-textMuted">Victorias del {match.teams.home.name}</span>
                   <span className="text-white font-bold">45%</span>
                 </div>
                 <div className="w-full bg-surface rounded-full h-2">
                   <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                 </div>
                 
                 <div className="flex justify-between text-sm mt-2">
                   <span className="text-textMuted">Victorias del {match.teams.away.name}</span>
                   <span className="text-white font-bold">30%</span>
                 </div>
                 <div className="w-full bg-surface rounded-full h-2">
                   <div className="bg-secondary h-2 rounded-full" style={{ width: '30%' }}></div>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column - Alternatives */}
        <div className="space-y-6">
          <div className="glass-panel border border-border rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="text-secondary w-5 h-5" /> Apuestas Alternativas
            </h3>
            
            <div className="space-y-4">
              {analyzing ? (
                 <div className="animate-pulse space-y-4">
                   <div className="h-16 bg-white/5 rounded-xl"></div>
                   <div className="h-16 bg-white/5 rounded-xl"></div>
                 </div>
              ) : aiAnalysis?.alternatives.map((alt, i) => (
                <div key={i} className="p-3 rounded-xl bg-surface border border-transparent hover:border-border transition-colors group cursor-pointer">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors">{alt.title}</span>
                    <span className="text-xs bg-white/5 px-2 py-1 rounded text-textMuted">{alt.confidence}% Conf.</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-textMuted">Riesgo {alt.risk}</span>
                    <span className="font-bold text-white">{alt.odds}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel border border-border rounded-2xl p-6 bg-gradient-to-b from-transparent to-primary/5">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="w-6 h-6 text-accent" />
              <h3 className="font-bold text-white">Estadísticas Pro</h3>
            </div>
            <p className="text-sm text-textMuted mb-4">
              Desbloquea métricas avanzadas incluyendo goles esperados (xG), análisis de sesgo arbitral, y predicciones de marcador exacto.
            </p>
            <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-lg transition-colors">
              Mejorar a Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
