"use client";

import { ArrowLeft, ShieldCheck, Zap, Activity, Info, Check } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function PredictionDetailPage({ params }: { params: { matchId: string } }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `🎯 Predikta AI - Apuesta Recomendada\n✅ Gana Arsenal (1X2) (Arsenal vs Chelsea)\n📈 Mejores Cuotas: 1.85`;

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
            Premier League
          </span>
          <div className="flex justify-center items-center gap-4 sm:gap-8 md:gap-16">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-surface border-4 border-white/5 flex items-center justify-center text-4xl shadow-2xl mb-4">🔴</div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Arsenal</h2>
              <span className="text-sm text-textMuted mt-1">Local</span>
            </div>
            
            <div className="flex flex-col items-center shrink-0">
              <div className="text-4xl md:text-5xl font-black text-white tracking-widest mb-2 whitespace-nowrap">2 - 1</div>
              <span className="text-accent font-bold text-sm animate-pulse whitespace-nowrap">EN VIVO 67'</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-surface border-4 border-white/5 flex items-center justify-center text-4xl shadow-2xl mb-4">🔵</div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Chelsea</h2>
              <span className="text-sm text-textMuted mt-1">Visitante</span>
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
                  <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Zap className="text-primary w-6 h-6" /> Mejor Predicción de IA
                  </h3>
                  <p className="text-textMuted">Basado en más de 10,000 puntos de datos y el historial H2H</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="text-sm text-textMuted mb-1">Puntaje de Confianza</div>
                  <div className="text-3xl font-black text-accent">78%</div>
                </div>
             </div>

             <div className="bg-surface border border-primary/20 rounded-xl p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-textMuted mb-1">Apuesta Recomendada</div>
                  <div className="text-xl font-bold text-primary">Gana Arsenal (1X2)</div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className="text-sm text-textMuted mb-1">Mejores Cuotas</div>
                    <div className="text-xl font-bold text-white">1.85</div>
                  </div>
                  <button 
                    onClick={handleCopy}
                    className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center gap-2"
                  >
                    {copied ? <><Check className="w-4 h-4" /> Copiado</> : "Copiar Apuesta"}
                  </button>
                </div>
             </div>

             <div>
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-textMuted" /> Razonamiento de IA
                </h4>
                <p className="text-textMuted text-sm leading-relaxed mb-4">
                  El Arsenal ha ganado sus últimos 5 partidos en casa con un promedio de 2.4 goles anotados. La forma del Chelsea como visitante ha sido pobre, concediendo en 8 de sus últimos 10 partidos. Las lesiones de jugadores clave para el Chelsea (mediocampo) le dan al Arsenal una ventaja estadística significativa en el control de posesión (estimado 62%).
                </p>
             </div>
          </div>

          {/* Form and Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel border border-border rounded-2xl p-6">
               <h4 className="text-white font-semibold mb-4">Forma Reciente</h4>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-textMuted">Arsenal</span>
                    <div className="flex gap-1">
                      {['W','W','W','D','W'].map((r, i) => (
                        <span key={i} className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${r === 'W' ? 'bg-accent/20 text-accent' : r === 'D' ? 'bg-white/10 text-textMuted' : 'bg-danger/20 text-danger'}`}>{r}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-textMuted">Chelsea</span>
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
                   <span className="text-textMuted">Victorias del Arsenal</span>
                   <span className="text-white font-bold">45%</span>
                 </div>
                 <div className="w-full bg-surface rounded-full h-2">
                   <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                 </div>
                 
                 <div className="flex justify-between text-sm mt-2">
                   <span className="text-textMuted">Victorias del Chelsea</span>
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
              <div className="p-3 rounded-xl bg-surface border border-transparent hover:border-border transition-colors group cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors">Más de 2.5 Goles</span>
                  <span className="text-xs bg-white/5 px-2 py-1 rounded text-textMuted">65% Conf.</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-textMuted">Riesgo Medio</span>
                  <span className="font-bold text-white">1.72</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface border border-transparent hover:border-border transition-colors group cursor-pointer">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-white group-hover:text-secondary transition-colors">Ambos Equipos Marcan</span>
                  <span className="text-xs bg-white/5 px-2 py-1 rounded text-textMuted">58% Conf.</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-textMuted">Riesgo Medio</span>
                  <span className="font-bold text-white">1.90</span>
                </div>
              </div>
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
