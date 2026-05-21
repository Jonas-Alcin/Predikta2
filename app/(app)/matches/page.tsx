"use client";

import { Calendar, Filter, ChevronDown, Tv } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { getMatchesByDate } from "@/app/actions/football";
import { APIFootballFixture } from "@/lib/types";

const LEAGUES = [
  { id: "all", name: "Todas las Ligas", flag: null },
  { id: "premier", name: "Premier League", flag: "https://flagcdn.com/w40/gb-eng.png" },
  { id: "laliga", name: "La Liga", flag: "https://flagcdn.com/w40/es.png" },
  { id: "seriea", name: "Serie A", flag: "https://flagcdn.com/w40/it.png" },
  { id: "bundesliga", name: "Bundesliga", flag: "https://flagcdn.com/w40/de.png" },
  { id: "ligue1", name: "Ligue 1", flag: "https://flagcdn.com/w40/fr.png" },
  { id: "brasileirao", name: "Brasileirão", flag: "https://flagcdn.com/w40/br.png" },
  { id: "primera-chile", name: "Primera División (CL)", flag: "https://flagcdn.com/w40/cl.png" },
];

const getFormattedDate = (date: Date) => date.toISOString().split('T')[0];
const today = new Date();
const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfter = new Date(today); dayAfter.setDate(dayAfter.getDate() + 2);

const DATES_MAP: Record<string, string> = {
  "HOY": getFormattedDate(today),
  "MAÑANA": getFormattedDate(tomorrow),
  "PASADO": getFormattedDate(dayAfter)
};
const datesKeys = Object.keys(DATES_MAP);
export default function MatchesPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(LEAGUES[0]);
  const [selectedDate, setSelectedDate] = useState(datesKeys[0]);
  
  const [matches, setMatches] = useState<APIFootballFixture[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      const dateString = DATES_MAP[selectedDate] || DATES_MAP["HOY"];
      const data = await getMatchesByDate(dateString);
      setMatches(data);
      setLoading(false);
    }
    loadMatches();
  }, [selectedDate]);

  // Group real matches by league name
  const groupedMatches: Record<string, APIFootballFixture[]> = {};
  matches.forEach(match => {
    const lg = match.league.name;
    if (!groupedMatches[lg]) groupedMatches[lg] = [];
    groupedMatches[lg].push(match);
  });

  const leaguesToRender = selectedLeague.id === "all" 
    ? LEAGUES.slice(1).filter(l => groupedMatches[l.name] && groupedMatches[l.name].length > 0)
    : [selectedLeague].filter(l => groupedMatches[l.name] && groupedMatches[l.name].length > 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header y Filtro */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-3">
            <Calendar className="text-[#d9f95d] w-6 h-6 md:w-8 md:h-8" /> 
            Partidos
          </h1>
          <p className="text-textMuted mt-1 text-sm md:text-base">Consulta los horarios y cuotas de los próximos encuentros.</p>
        </div>
        
        <div className="relative z-50" ref={dropdownRef}>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full md:w-auto px-4 py-2.5 md:px-5 md:py-3 bg-[#131418] border border-white/10 rounded-xl text-sm text-white hover:border-[#d9f95d]/50 transition-colors flex items-center justify-between md:justify-start gap-3 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#d9f95d]" /> 
              <span className="font-medium">{selectedLeague.id === "all" ? "Filtrar por Liga" : selectedLeague.name}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-[#d9f95d] transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
          </button>
          
          {isFilterOpen && (
            <div className="absolute right-0 md:right-0 mt-2 w-full md:w-64 bg-[#0b0c10] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
              <div className="max-h-[60vh] overflow-y-auto py-2">
                {LEAGUES.map((league) => (
                  <button
                    key={league.id}
                    onClick={() => {
                      setSelectedLeague(league);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 md:px-5 py-3 text-sm text-left hover:bg-white/5 transition-colors ${
                      selectedLeague.id === league.id ? "bg-[#d9f95d]/10 text-[#d9f95d] font-bold border-l-2 border-[#d9f95d]" : "text-white border-l-2 border-transparent"
                    }`}
                  >
                    {league.flag ? (
                      <img src={league.flag} alt={league.name} className="w-5 h-3 rounded-sm object-cover" />
                    ) : (
                      <div className="w-5 h-3"></div>
                    )}
                    {league.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selector de Fechas (Estilo Tabs) */}
      <div className="bg-[#131418] border-b border-white/5 -mx-4 md:mx-0 px-4 md:px-6 rounded-t-2xl mt-4">
        <div className="flex overflow-x-auto scrollbar-hide">
          {datesKeys.map((date) => (
            <button
              key={date}
              onClick={() => setSelectedDate(date)}
              className={`px-4 md:px-6 py-4 text-xs md:text-sm font-bold whitespace-nowrap transition-all border-b-2 uppercase tracking-wide ${
                selectedDate === date 
                  ? "border-[#d9f95d] text-[#d9f95d]" 
                  : "border-transparent text-textMuted hover:text-white"
              }`}
            >
              {date}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Ligas y Partidos */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-white/50 text-center py-10 animate-pulse">Cargando partidos de {selectedDate.toLowerCase()}...</div>
        ) : leaguesToRender.length === 0 ? (
          <div className="text-white/50 text-center py-10">No hay partidos de las ligas principales programados para esta fecha.</div>
        ) : leaguesToRender.map((league) => (
          <div key={league.id} className="bg-[#0b0c10] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            
            {/* Header de Liga */}
            <div className="bg-[#131418] px-4 py-3 flex items-center gap-3 border-b border-white/5">
              {league.flag ? <img src={league.flag} alt={league.name} className="w-6 h-4 rounded-sm object-cover" /> : <div className="w-6 h-4"></div>}
              <h3 className="text-sm md:text-base font-extrabold text-white uppercase tracking-wider">{league.name}</h3>
            </div>

            {/* Filas de Partidos */}
            <div className="divide-y divide-white/5">
              {(groupedMatches[league.name] || []).map((match) => {
                const isLive = ["1H", "2H", "HT"].includes(match.fixture.status.short);
                const timeStr = new Date(match.fixture.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                return (
                  <Link href={`/predictions/${match.fixture.id}`} key={match.fixture.id} className="flex flex-col md:flex-row items-center justify-between p-3 md:p-4 md:px-6 hover:bg-white/5 transition-colors group cursor-pointer">
                    
                    {/* Izquierda: Canal de TV (Oculto en móvil, visible en md) */}
                    <div className="w-full md:w-32 mb-2 md:mb-0 flex items-center gap-1.5 text-[10px] text-textMuted md:justify-start">
                      {isLive && <span className="w-2 h-2 rounded-full bg-[#d9f95d] animate-pulse"></span>}
                      <span>{isLive ? `EN VIVO ${match.fixture.status.elapsed}'` : match.fixture.status.short}</span>
                    </div>

                    {/* Centro: Marcador/Hora y Equipos */}
                    <div className="flex items-center justify-between w-full md:flex-1 md:px-8">
                      {/* Equipo Local */}
                      <div className="flex items-center justify-end flex-1 min-w-0 gap-2 md:gap-3">
                        <span className="font-bold text-[13px] sm:text-sm md:text-base text-white text-right truncate group-hover:text-[#d9f95d] transition-colors">{match.teams.home.name}</span>
                        <img src={match.teams.home.logo} alt={match.teams.home.name} className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-white/10 object-contain p-1 shadow-inner shrink-0" />
                      </div>
                      
                      {/* Hora / Marcador */}
                      <div className="flex flex-col items-center justify-center w-20 sm:w-24 md:w-32 shrink-0 px-2">
                        <span className={`font-bold text-[13px] sm:text-[14px] md:text-base tracking-wider text-center whitespace-nowrap ${isLive || match.fixture.status.short === 'FT' ? 'text-white' : 'text-[#d9f95d]'}`}>
                          {(isLive || match.fixture.status.short === 'FT') 
                            ? `${match.goals.home ?? 0} - ${match.goals.away ?? 0}` 
                            : timeStr}
                        </span>
                      </div>
                      
                      {/* Equipo Visitante */}
                      <div className="flex items-center justify-start flex-1 min-w-0 gap-2 md:gap-3">
                        <img src={match.teams.away.logo} alt={match.teams.away.name} className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-white/10 object-contain p-1 shadow-inner shrink-0" />
                        <span className="font-bold text-[13px] sm:text-sm md:text-base text-white text-left truncate group-hover:text-[#d9f95d] transition-colors">{match.teams.away.name}</span>
                      </div>
                    </div>

                  </Link>
                );
              })}
            </div>
            
          </div>
        ))}
      </div>

    </div>
  );
}
