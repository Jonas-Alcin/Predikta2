"use client";

import { Trophy, ShieldCheck, Flame, AlertTriangle, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { getTodaysMatches } from "@/app/actions/football";
import { APIFootballFixture } from "@/lib/types";

type BetLeg = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  leagueIcon?: string;
};

type Slip = {
  id: string;
  type: string;
  description: string;
  icon: any;
  legs: BetLeg[];
};

export default function DashboardPage() {
  const [generated, setGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [slips, setSlips] = useState<Slip[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [matches, setMatches] = useState<APIFootballFixture[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  useEffect(() => {
    async function loadMatches() {
      const data = await getTodaysMatches();
      setMatches(data);
      setLoadingMatches(false);
    }
    loadMatches();
  }, []);

  const generateSlips = (): Slip[] => {
    const upcomingMatches = matches.filter(m => !["FT", "AET", "PEN", "PST", "CANC", "ABD"].includes(m.fixture.status.short));
    
    // We need up to 5 unique matches if possible, else we loop them.
    const m = (index: number) => upcomingMatches[index % upcomingMatches.length] || null;
    
    const getLeg = (matchIndex: number, type: "winner" | "goals" | "corners" | "player" | "cards") => {
      const match = m(matchIndex);
      if (!match) return { id: `mock-${Math.random()}`, title: "Apuesta", subtitle: "Partido", date: "Hoy", leagueIcon: undefined };
      
      const teamH = match.teams.home.name;
      const teamA = match.teams.away.name;
      const date = new Date(match.fixture.date).toLocaleString([], {day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'});
      const lg = match.league.logo;
      
      let title = "";
      if (type === "winner") title = `Gana ${teamH} o Empate`;
      else if (type === "goals") title = "Más de 1.5 Goles Totales";
      else if (type === "corners") title = `Más de 8.5 Córners Totales`;
      else if (type === "player") {
        const players: Record<string, string> = {
          "Arsenal": "Saka", "Chelsea": "Palmer", "Real Madrid": "Vinícius Jr", 
          "Valencia": "Hugo Duro", "Man City": "Haaland", "Liverpool": "Salah", 
          "Barcelona": "Lewandowski", "Sevilla": "En-Nesyri"
        };
        const playerName = players[teamH] || "Goleador Principal";
        title = `Gol de ${playerName}`;
      }
      else if (type === "cards") title = `Más de 3.5 Tarjetas Amarillas`;

      return {
        id: `leg-${match.fixture.id}-${type}`,
        title,
        subtitle: `${teamH} vs ${teamA}`,
        date,
        leagueIcon: lg
      };
    };

    return [
      {
        id: "slip-1",
        type: "Conservadora",
        icon: ShieldCheck,
        description: "Al menos 3 selecciones muy seguras basadas en historial.",
        legs: [
          getLeg(0, "winner"),
          getLeg(1, "winner"),
          getLeg(2, "goals")
        ]
      },
      {
        id: "slip-2",
        type: "Equilibrada",
        icon: Flame,
        description: "Más de 3 selecciones balanceadas con goles y córners.",
        legs: [
          getLeg(0, "winner"),
          getLeg(1, "goals"),
          getLeg(2, "corners"),
          getLeg(3, "winner")
        ]
      },
      {
        id: "slip-3",
        type: "Alto Riesgo",
        icon: AlertTriangle,
        description: "Al menos 5 selecciones avanzadas (jugadores, tarjetas, etc).",
        legs: [
          getLeg(0, "winner"),
          getLeg(1, "goals"),
          getLeg(2, "corners"),
          getLeg(3, "player"),
          getLeg(4, "cards")
        ]
      }
    ];
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenerated(false);
    
    setTimeout(() => {
      setSlips(generateSlips());
      setIsGenerating(false);
      setGenerated(true);
    }, 1500);
  };

  const handleBetAction = (slip: Slip, url: string) => {
    const text = `🎯 Predikta AI - Ficha ${slip.type}\n` +
      slip.legs.map(l => `✅ ${l.title} (${l.subtitle})`).join('\n');
    
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
    
    setCopiedId(slip.id);
    setTimeout(() => setCopiedId(null), 2000);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-10">
      <div className="max-w-xl mx-auto mt-8 md:mt-12 text-center px-4">
        <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white leading-[1.1] mb-6">
          Generador de <span className="text-[#d9f95d]">Fichas</span>
        </h2>
        <p className="text-textMuted text-sm md:text-base mb-8">
          Obtén 3 combinadas optimizadas por IA basadas en estadísticas reales de los partidos de hoy.
        </p>

        <form onSubmit={handleGenerate}>
          <button 
            type="submit"
            disabled={isGenerating || loadingMatches}
            className="w-full bg-[#d9f95d] hover:bg-[#c8ea4f] text-black font-bold py-4 md:py-5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 text-lg tracking-wide uppercase disabled:opacity-50"
          >
            {isGenerating ? "Analizando Partidos..." : "🎯 Generar Fichas Ahora"}
          </button>
        </form>
      </div>

      {generated && (
        <div className="pt-8 animate-in slide-in-from-bottom-8 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
             {slips.map((slip) => {
               const Icon = slip.icon;

               return (
                 <div key={slip.id} className="bg-[#f0f2f5] rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full border border-gray-200">
                   {/* Cabecera Oscura */}
                   <div className="bg-[#2d2f3a] text-white p-4 flex items-center justify-between relative overflow-hidden">
                     <div className="flex items-center gap-2 relative z-10">
                       <Icon className="text-white w-5 h-5" />
                       <span className="font-bold text-lg">{slip.type}</span>
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
                   <div className="p-4 space-y-4 flex-grow bg-white">
                     {slip.legs.map((leg, idx) => (
                       <div key={leg.id} className="relative">
                         <div className="flex items-start gap-3">
                           <div className="mt-1">
                             {leg.leagueIcon ? (
                               <img src={leg.leagueIcon} alt="League" className="w-6 h-6 object-contain" />
                             ) : (
                               <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                             )}
                           </div>
                           <div className="flex-1">
                             <div className="font-bold text-gray-900 text-sm leading-tight mb-1">{leg.title}</div>
                             <div className="text-xs text-gray-600 mb-0.5">{leg.subtitle}</div>
                             <div className="text-[11px] text-gray-500">{leg.date}</div>
                           </div>
                         </div>
                         {idx < slip.legs.length - 1 && (
                           <div className="border-b border-dashed border-gray-300 my-3 ml-9"></div>
                         )}
                       </div>
                     ))}
                   </div>

                   {/* Footer con Casas de Apuestas */}
                   <div className="bg-gray-50 p-4 border-t border-gray-200 mt-auto">
                     <p className="text-center text-xs text-gray-500 font-bold mb-3 uppercase tracking-wider">Apostar esta ficha en:</p>
                     <div className="flex items-center gap-2">
                       <button onClick={() => handleBetAction(slip, 'https://www.betano.com')} className="flex-1 py-2 rounded-lg text-xs font-bold transition-colors bg-[#ff6b00] text-white hover:bg-[#e56000] border border-[#d65a00] shadow-sm">
                         Betano
                       </button>
                       <button onClick={() => handleBetAction(slip, 'https://1xbet.com')} className="flex-1 py-2 rounded-lg text-xs font-bold transition-colors bg-[#1e2329] text-white hover:bg-[#121518] border border-gray-900 shadow-sm">
                         1xBet
                       </button>
                       <button onClick={() => handleBetAction(slip, 'https://jugabet.cl')} className="flex-1 py-2 rounded-lg text-xs font-bold transition-colors bg-[#ffffff] text-[#001d4a] hover:bg-gray-100 border border-[#001d4a] shadow-sm">
                         JugaBet
                       </button>
                     </div>
                     {copiedId === slip.id && (
                       <div className="mt-3 text-center text-xs font-bold text-green-600 flex items-center justify-center gap-1">
                         <Check className="w-3 h-3" /> Ficha y selecciones copiadas al portapapeles
                       </div>
                     )}
                   </div>
                 </div>
               );
             })}
           </div>
        </div>
      )}
    </div>
  );
}
