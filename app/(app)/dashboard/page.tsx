"use client";

import { Trophy, ChevronRight, ShieldCheck, Flame, AlertTriangle, Edit2, Copy, Check, X, Plus, Trash2, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type BetLeg = {
  id: string;
  title: string;
  subtitle: string;
  odds: number;
};

type Slip = {
  id: string;
  type: string;
  description: string;
  explanation: string;
  theme: "primary" | "white";
  icon: any;
  legs: BetLeg[];
};

export default function DashboardPage() {
  const [budget, setBudget] = useState("2000");
  const [target, setTarget] = useState("25000");
  const [generated, setGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // States for slips and editing
  const [slips, setSlips] = useState<Slip[]>([]);
  const [editingSlipId, setEditingSlipId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const numBudget = Number(budget) || 0;
  const numTarget = Number(target) || 0;
  
  const multiplier = numBudget > 0 && numTarget > 0 
    ? (numTarget / numBudget).toFixed(1) 
    : "0.0";

  const generateMockSlips = (mult: number): Slip[] => {
    const safeBase = Math.max(1.50, mult * 0.25);
    const balancedBase = Math.max(3.00, mult * 0.6);
    const riskBase = Math.max(6.00, mult * 1.5); // Alto Riesgo must always be higher than the target mult

    // Equilibrada math: leg1 * leg2 = balancedBase
    const eqLeg1 = Math.sqrt(balancedBase) * 0.85;
    const eqLeg2 = balancedBase / eqLeg1;

    // Alto Riesgo math: leg1 * leg2 * leg3 = riskBase
    const arLeg1 = Math.cbrt(riskBase) * 0.9;
    const arLeg2 = Math.cbrt(riskBase) * 1.1;
    const arLeg3 = riskBase / (arLeg1 * arLeg2);

    return [
      {
        id: "slip-1",
        type: "Conservadora",
        theme: "primary",
        icon: ShieldCheck,
        description: "Apuestas simples de alta probabilidad.",
        explanation: "💡 IA: El Arsenal promedia 2.5 goles en casa y el Chelsea tiene bajas críticas en su línea defensiva hoy.",
        legs: [
          { id: "l1", title: "Arsenal Gana", subtitle: "vs Chelsea", odds: safeBase }
        ]
      },
      {
        id: "slip-2",
        type: "Equilibrada",
        theme: "primary",
        icon: Flame,
        description: "Combinada corta con gran valor estadístico.",
        explanation: "💡 IA: Real Madrid no ha perdido de local en 15 partidos. Los duelos Juve-Milan tienen 80% de probabilidad de 'Ambos Marcan' según el histórico.",
        legs: [
          { id: "l2", title: "Real Madrid Gana", subtitle: "vs Valencia", odds: eqLeg1 },
          { id: "l3", title: "Ambos Marcan", subtitle: "Juve vs Milan", odds: eqLeg2 }
        ]
      },
      {
        id: "slip-3",
        type: "Alto Riesgo",
        theme: "primary",
        icon: AlertTriangle,
        description: "Combinada diseñada para superar tu objetivo.",
        explanation: "💡 IA: Se proyecta un partido muy abierto en Mánchester, ideal para overs. Vinicius y Saka tienen los índices de remate más altos de sus ligas actualmente.",
        legs: [
          { id: "l4", title: "Saka > 1.5 Tiros a Puerta", subtitle: "Arsenal vs Chelsea", odds: arLeg1 },
          { id: "l5", title: "Vinicius Anota", subtitle: "Real Madrid vs Valencia", odds: arLeg2 },
          { id: "l6", title: "> 9.5 Corners Totales", subtitle: "City vs Liv", odds: arLeg3 }
        ]
      }
    ];
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budget || !target) return;
    
    setIsGenerating(true);
    setGenerated(false);
    
    setTimeout(() => {
      setSlips(generateMockSlips(Number(multiplier)));
      setIsGenerating(false);
      setGenerated(true);
    }, 1500);
  };

  const handleCopy = (slip: Slip) => {
    const totalOdds = slip.legs.reduce((acc, leg) => acc * leg.odds, 1);
    const text = `🎯 Predikta AI - Ficha ${slip.type}\n` +
      slip.legs.map(l => `✅ ${l.title} (${l.subtitle}) - Cuota: ${l.odds.toFixed(2)}`).join('\n') + 
      `\n📈 Cuota Total: ${totalOdds.toFixed(2)}\n💰 A apostar: $${numBudget}`;
    
    // Copy with fallback
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
    
    setCopiedId(slip.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const removeLeg = (slipId: string, legId: string) => {
    setSlips(prev => prev.map(slip => {
      if (slip.id === slipId) {
        return { ...slip, legs: slip.legs.filter(l => l.id !== legId) };
      }
      return slip;
    }));
  };

  const addMockLeg = (slipId: string) => {
    const mockLeg = { 
      id: Date.now().toString(), 
      title: "Más de 1.5 Goles", 
      subtitle: "Partido Adicional", 
      odds: 1.45 
    };
    setSlips(prev => prev.map(slip => {
      if (slip.id === slipId) {
        return { ...slip, legs: [...slip.legs, mockLeg] };
      }
      return slip;
    }));
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-10">
      {/* Generador de Fichas */}
      <div className="max-w-md mx-auto mt-4">
        <div className="bg-[#0b0c10] border border-white/5 rounded-[2rem] p-5 md:p-8 shadow-2xl mb-10 relative">
          <form onSubmit={handleGenerate} className="space-y-6 relative z-10">
            {/* Cuanto Tienes */}
            <div className="space-y-2">
              <div className="flex justify-between items-end text-[10px] font-bold tracking-[0.2em] text-[#666666] uppercase">
                <span>¿Cuánto tienes?</span>
                <span>CLP $</span>
              </div>
              <div className="bg-[#131418] border border-white/5 rounded-2xl flex items-center px-4 py-3 md:px-5 md:py-4 focus-within:border-white/10 transition-colors">
                <span className="text-[#666666] font-bold text-lg md:text-xl mr-3">$</span>
                <input 
                  type="number" 
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="2000"
                  className="bg-transparent text-white text-xl md:text-2xl font-medium outline-none w-full placeholder:text-white/20"
                />
              </div>
            </div>

            {/* Cuanto Quieres Ganar */}
            <div className="space-y-2">
              <div className="flex justify-between items-end text-[10px] font-bold tracking-[0.2em] text-[#666666] uppercase">
                <span>¿Cuánto quieres ganar?</span>
                <span>CLP $</span>
              </div>
              <div className="bg-[#131418] border border-white/5 rounded-2xl flex items-center px-4 py-3 md:px-5 md:py-4 focus-within:border-[#d9f95d]/30 transition-colors">
                <span className="text-[#666666] font-bold text-lg md:text-xl mr-3">$</span>
                <input 
                  type="number" 
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="25000"
                  className="bg-transparent text-[#d9f95d] text-xl md:text-2xl font-medium outline-none w-full placeholder:text-[#d9f95d]/20"
                />
              </div>
            </div>

            {/* Multiplicador */}
            <div className="bg-[#131418] border border-[#d9f95d]/20 rounded-2xl flex justify-between items-center px-4 py-4 md:px-5 md:py-5 mt-2">
              <span className="text-[10px] font-bold tracking-[0.2em] text-[#666666] uppercase">Necesitas multiplicar</span>
              <span className="text-[#d9f95d] text-2xl md:text-3xl font-medium tracking-tight">
                x{multiplier}
              </span>
            </div>

            {/* Botón */}
            <button 
              type="submit"
              disabled={isGenerating || !budget || !target}
              className="w-full bg-[#d9f95d] hover:bg-[#c8ea4f] text-black font-bold py-3 md:py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 text-sm md:text-[15px] tracking-wide uppercase mt-4 disabled:opacity-50"
            >
              {isGenerating ? "Generando..." : "🎯 Ver mis fichas"}
            </button>
          </form>
        </div>

        {/* Cómo Funciona */}
        <div className="px-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-4 bg-[#d9f95d] rounded-sm"></div>
            <h4 className="text-[#666666] font-bold tracking-[0.2em] text-[10px] uppercase">¿Cómo funciona?</h4>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-4">
              <span className="text-[#d9f95d] font-mono text-sm mt-0.5">01</span>
              <span className="text-[#888888] text-sm">Ingresas cuánto tienes y cuánto quieres ganar</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-[#d9f95d] font-mono text-sm mt-0.5">02</span>
              <span className="text-[#888888] text-sm">Calculamos el multiplicador que necesitas</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-[#d9f95d] font-mono text-sm mt-0.5">03</span>
              <span className="text-[#888888] text-sm">Te mostramos fichas con partidos y estadísticas reales</span>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-[#d9f95d] font-mono text-sm mt-0.5">04</span>
              <span className="text-[#888888] text-sm">Copia la ficha y pégala en Betsson, Coolbet u otra casa de apuestas</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Resultados de Fichas */}
      {generated && (
        <div className="pt-8 border-t border-border animate-in slide-in-from-bottom-8 duration-500">
           <h2 className="text-2xl font-bold text-white mb-6 text-center">Fichas Generadas para ti</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
             {slips.map((slip) => {
               const Icon = slip.icon;
               const isPrimary = slip.theme === "primary";
               const colorClass = isPrimary ? "text-[#d9f95d]" : "text-white";
               const borderClass = isPrimary ? "border-[#d9f95d]/30 hover:border-[#d9f95d]" : "border-white/10 hover:border-white/30";
               const totalOdds = slip.legs.reduce((acc, leg) => acc * leg.odds, 1);
               const isEditing = editingSlipId === slip.id;

               return (
                 <div key={slip.id} className={`bg-[#131418] border ${borderClass} rounded-3xl p-6 transition-all relative flex flex-col h-full group ${isEditing ? 'ring-2 ring-white/20' : ''}`}>
                   {isPrimary && <div className="absolute top-0 left-0 w-full h-1 bg-[#d9f95d]"></div>}
                   
                   {/* Cabecera */}
                   <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center gap-2">
                       <Icon className={`${colorClass} w-6 h-6`} />
                       <span className={`font-bold text-lg ${colorClass}`}>{slip.type}</span>
                     </div>
                     <div className="flex gap-2">
                       <button 
                         onClick={() => setEditingSlipId(isEditing ? null : slip.id)} 
                         className={`p-1.5 rounded-md transition-colors ${isEditing ? 'bg-white/10 text-white' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
                         title={isEditing ? "Terminar edición" : "Editar selecciones"}
                       >
                         <Edit2 className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleCopy(slip)} 
                         className="p-1.5 rounded-md text-textMuted hover:text-[#d9f95d] hover:bg-white/5 transition-colors"
                         title="Copiar ficha"
                       >
                         {copiedId === slip.id ? <Check className="w-4 h-4 text-[#d9f95d]" /> : <Copy className="w-4 h-4" />}
                       </button>
                     </div>
                   </div>

                   <p className="text-sm text-textMuted mb-4">{slip.description}</p>
                   
                   {/* Explicación IA */}
                   <div className="bg-[#181a20] border border-white/5 rounded-xl p-3 mb-6 relative overflow-hidden">
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#d9f95d]/50 to-transparent"></div>
                     <p className="text-[12px] text-white/80 font-medium leading-relaxed pl-2">
                       {slip.explanation}
                     </p>
                   </div>

                   {/* Selecciones (Legs) - Timeline Style */}
                   <div className="relative mb-6 flex-grow mt-2">
                     {slip.legs.length > 1 && (
                       <div className="absolute left-[4px] top-3 bottom-8 w-[2px] bg-white/10"></div>
                     )}
                     
                     <div className="space-y-5">
                       {slip.legs.map((leg) => (
                         <div key={leg.id} className="relative flex items-start group">
                           {/* Timeline Node */}
                           <div className="absolute left-0 top-1.5 w-[10px] h-[10px] rounded-full border-[2.5px] border-[#d9f95d] bg-[#131418] z-10"></div>
                           
                           <div className="flex-1 pl-5 pr-2">
                             <span className="font-bold text-white text-sm block leading-tight">{leg.title}</span>
                             <span className="text-[11px] text-textMuted block mt-0.5">{leg.subtitle}</span>
                           </div>
                           
                           <div className="flex items-center gap-3">
                             <span className="text-white font-bold text-sm">{leg.odds.toFixed(2)}</span>
                             <button 
                               onClick={() => removeLeg(slip.id, leg.id)}
                               className="text-textMuted hover:text-danger p-1 transition-colors"
                               title="Eliminar selección"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                         </div>
                       ))}
                       
                       {isEditing && (
                         <button 
                           onClick={() => addMockLeg(slip.id)}
                           className="w-full py-2.5 mt-4 border border-dashed border-white/20 rounded-xl text-xs font-bold text-textMuted hover:text-white hover:border-white/50 transition-colors flex items-center justify-center gap-1 bg-white/5 hover:bg-white/10"
                         >
                           <Plus className="w-4 h-4" /> Añadir selección
                         </button>
                       )}
                       
                       {slip.legs.length === 0 && !isEditing && (
                         <div className="text-center text-textMuted text-sm py-4">
                           No hay selecciones. Edita la ficha para agregar.
                         </div>
                       )}
                     </div>
                   </div>

                   {/* Info Box */}
                   {slip.legs.length > 0 && (
                     <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex gap-2 mb-4">
                       <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                       <p className="text-[10px] text-textMuted leading-snug">
                         Si un jugador no inicia, se anularán sus selecciones vinculadas. Las cuotas se volverán a calcular para las selecciones restantes.
                       </p>
                     </div>
                   )}

                   {/* Footer */}
                   <div className="border-t border-white/10 pt-4 mt-auto">
                     <div className="flex items-center justify-between mb-4">
                       <div>
                         <span className="text-xs text-textMuted uppercase font-bold tracking-wider block">Cuota Total</span>
                         <span className="text-xl font-black text-white">{totalOdds.toFixed(2)}</span>
                       </div>
                       <div className="text-right">
                         <span className="text-xs text-textMuted uppercase font-bold tracking-wider block">Retorno</span>
                         <span className={`text-xl font-black ${colorClass}`}>${(numBudget * totalOdds).toFixed(0)}</span>
                       </div>
                     </div>
                     <button 
                       onClick={() => handleCopy(slip)} 
                       className={`w-full py-3.5 rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2 ${
                         isPrimary ? "bg-[#d9f95d] text-black hover:bg-[#c8ea4f]" : "bg-white/10 text-white hover:bg-white/20"
                       }`}
                     >
                       {copiedId === slip.id ? (
                         <><Check className="w-4 h-4" /> ¡Ficha Copiada!</>
                       ) : (
                         "COPIAR Y APOSTAR"
                       )}
                     </button>
                   </div>
                 </div>
               );
             })}
           </div>
        </div>
      )}

      {/* Partidos Destacados */}
      <div className="pt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="text-[#d9f95d]" /> Partidos Destacados
          </h2>
          <Link href="/matches" className="text-sm font-medium text-textMuted hover:text-white flex items-center transition-colors">
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample Match Card */}
          <div className="glass-panel rounded-xl p-4 md:p-5 border border-border hover:border-white/20 transition-colors group cursor-pointer relative overflow-hidden bg-[#131418]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold px-2 py-1 bg-white/5 rounded text-textMuted">Premier League</span>
              <span className="text-xs font-bold text-[#d9f95d] flex items-center gap-1 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-[#d9f95d]"></span> EN VIVO 67'
              </span>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl shadow-inner">🔴</div>
                <span className="font-bold text-sm text-white">Arsenal</span>
              </div>
              <div className="px-4 text-center">
                <div className="text-2xl font-black text-white">2 - 1</div>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl shadow-inner">🔵</div>
                <span className="font-bold text-sm text-white">Chelsea</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-white/5 rounded-lg p-2 text-center border border-transparent hover:border-white/20 transition-colors">
                <div className="text-xs text-textMuted mb-1">1</div>
                <div className="font-bold text-white">1.85</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center border border-transparent hover:border-white/20 transition-colors">
                <div className="text-xs text-textMuted mb-1">X</div>
                <div className="font-bold text-white">3.40</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center border border-transparent hover:border-white/20 transition-colors">
                <div className="text-xs text-textMuted mb-1">2</div>
                <div className="font-bold text-white">4.20</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="text-xs text-textMuted">Predicción de IA:</div>
              <div className="text-sm font-bold text-[#d9f95d]">Gana Arsenal (78%)</div>
            </div>
          </div>
          
          {/* Sample Match Card 2 */}
          <div className="glass-panel rounded-xl p-4 md:p-5 border border-border hover:border-white/20 transition-colors group cursor-pointer relative overflow-hidden bg-[#131418]">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold px-2 py-1 bg-white/5 rounded text-textMuted">La Liga</span>
              <span className="text-xs font-bold text-textMuted">Hoy, 21:00</span>
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl shadow-inner">⚪</div>
                <span className="font-bold text-sm text-white">Real Madrid</span>
              </div>
              <div className="px-4 text-center">
                <div className="text-xl font-black text-textMuted">vs</div>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-xl shadow-inner">🦇</div>
                <span className="font-bold text-sm text-white">Valencia</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-white/5 rounded-lg p-2 text-center border border-transparent hover:border-white/20 transition-colors">
                <div className="text-xs text-textMuted mb-1">1</div>
                <div className="font-bold text-white">1.45</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center border border-transparent hover:border-white/20 transition-colors">
                <div className="text-xs text-textMuted mb-1">X</div>
                <div className="font-bold text-white">4.80</div>
              </div>
              <div className="bg-white/5 rounded-lg p-2 text-center border border-transparent hover:border-white/20 transition-colors">
                <div className="text-xs text-textMuted mb-1">2</div>
                <div className="font-bold text-white">7.50</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="text-xs text-textMuted">Predicción de IA:</div>
              <div className="text-sm font-bold text-white">Más de 2.5 Goles (82%)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
