"use client";

import { Calendar, Filter, ChevronDown, Tv } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

const LEAGUES = [
  { id: "all", name: "Todas las Ligas", flag: null },
  { id: "premier", name: "Premier League", flag: "https://flagcdn.com/w40/gb-eng.png" },
  { id: "laliga", name: "La Liga", flag: "https://flagcdn.com/w40/es.png" },
  { id: "seriea", name: "Serie A", flag: "https://flagcdn.com/w40/it.png" },
  { id: "bundesliga", name: "Bundesliga", flag: "https://flagcdn.com/w40/de.png" },
  { id: "ligue1", name: "Ligue 1", flag: "https://flagcdn.com/w40/fr.png" },
];

const MOCK_MATCHES: Record<string, any[]> = {
  premier: [
    { id: 1, teamA: "Arsenal", teamB: "Chelsea", time: "15:00", tv: "ESPN (Chl)" },
    { id: 2, teamA: "Man City", teamB: "Liverpool", time: "17:30", tv: "Disney+" },
    { id: 3, teamA: "Aston Villa", teamB: "Spurs", time: "20:00", tv: "Paramount+" },
  ],
  laliga: [
    { id: 4, teamA: "Real Madrid", teamB: "Valencia", time: "14:15", tv: "DirectTV" },
    { id: 5, teamA: "Barcelona", teamB: "Sevilla", time: "16:45", tv: "ESPN (Chl)" },
    { id: 6, teamA: "Atletico", teamB: "Betis", time: "19:00", tv: "Disney+" },
  ],
  seriea: [
    { id: 7, teamA: "Lazio", teamB: "Inter", time: "13:00", tv: "ESPN (Chl)" },
    { id: 8, teamA: "Milan", teamB: "Roma", time: "15:45", tv: "Star+" },
    { id: 9, teamA: "Napoli", teamB: "Juve", time: "18:00", tv: "Star+" },
  ],
  bundesliga: [
    { id: 10, teamA: "Bayern", teamB: "Dortmund", time: "10:30", tv: "ESPN" },
    { id: 11, teamA: "Leipzig", teamB: "Leverkusen", time: "13:30", tv: "Star+" },
    { id: 12, teamA: "Frankfurt", teamB: "Stuttgart", time: "15:30", tv: "Disney+" },
  ],
  ligue1: [
    { id: 13, teamA: "Lens", teamB: "PSG", time: "15:00", tv: "Disney+" },
    { id: 14, teamA: "Brest", teamB: "Strasbourg", time: "17:00", tv: "ESPN" },
    { id: 15, teamA: "Monaco", teamB: "Lille", time: "19:00", tv: "Star+" },
  ]
};

export default function MatchesPage() {
  const dates = ["HOY", "DIRECTO (9)", "MAÑANA", "JUE 14 MAY.", "VIE 15 MAY."];
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(LEAGUES[0]);
  const [selectedDate, setSelectedDate] = useState(dates[0]);
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

  const leaguesToRender = selectedLeague.id === "all" ? LEAGUES.slice(1) : [selectedLeague];

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
          {dates.map((date) => (
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
        {leaguesToRender.map((league) => (
          <div key={league.id} className="bg-[#0b0c10] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
            
            {/* Header de Liga */}
            <div className="bg-[#131418] px-4 py-3 flex items-center gap-3 border-b border-white/5">
              <img src={league.flag!} alt={league.name} className="w-6 h-4 rounded-sm object-cover" />
              <h3 className="text-sm md:text-base font-extrabold text-white uppercase tracking-wider">{league.name}</h3>
            </div>

            {/* Filas de Partidos */}
            <div className="divide-y divide-white/5">
              {(MOCK_MATCHES[league.id] || []).map((match, idx) => (
                <Link href={`/predictions/${match.id}`} key={match.id} className="flex flex-col md:flex-row items-center justify-between p-3 md:p-4 md:px-6 hover:bg-white/5 transition-colors group cursor-pointer">
                  
                  {/* Izquierda: Canal de TV (Oculto en móvil, visible en md) */}
                  <div className="w-full md:w-32 mb-2 md:mb-0 flex items-center gap-1.5 text-[10px] text-textMuted md:justify-start">
                    <Tv className="w-3 h-3 opacity-50" />
                    <span>{match.tv}</span>
                  </div>

                  {/* Centro: Marcador/Hora y Equipos */}
                  <div className="flex items-center justify-between w-full md:flex-1 md:px-8">
                    {/* Equipo Local */}
                    <div className="flex items-center justify-end flex-1 min-w-0 gap-2 md:gap-3">
                      <span className="font-bold text-[13px] sm:text-sm md:text-base text-white text-right truncate group-hover:text-[#d9f95d] transition-colors">{match.teamA}</span>
                      <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-xs shadow-inner shrink-0">
                        <span className="opacity-50 font-bold">{match.teamA.charAt(0)}</span>
                      </div>
                    </div>
                    
                    {/* Hora / Marcador */}
                    <div className="flex flex-col items-center justify-center w-16 sm:w-20 md:w-28 shrink-0 px-2">
                      <span className="font-bold text-[#d9f95d] text-[15px] sm:text-base md:text-lg tracking-wider">{match.time}</span>
                    </div>
                    
                    {/* Equipo Visitante */}
                    <div className="flex items-center justify-start flex-1 min-w-0 gap-2 md:gap-3">
                      <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-white/10 flex items-center justify-center text-xs shadow-inner shrink-0">
                        <span className="opacity-50 font-bold">{match.teamB.charAt(0)}</span>
                      </div>
                      <span className="font-bold text-[13px] sm:text-sm md:text-base text-white text-left truncate group-hover:text-[#d9f95d] transition-colors">{match.teamB}</span>
                    </div>
                  </div>

                </Link>
              ))}
            </div>
            
          </div>
        ))}
      </div>

    </div>
  );
}
