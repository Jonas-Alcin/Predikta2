"use client";

import { Bell, Check, Zap, Trophy, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function NotificationBell({ hasUser }: { hasUser: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(hasUser);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setUnread(false);
  };

  if (!hasUser) {
    return (
      <button className="relative p-2 text-textMuted hover:text-white transition-colors">
        <Bell className="w-5 h-5" />
      </button>
    );
  }

  const notifications = [
    { id: 1, title: "Predicción Acertada", message: "¡Tu ficha conservadora fue exitosa! El Arsenal ganó en casa tal como indicaba el análisis.", time: "Hace 5 min", icon: Check, color: "text-accent", bg: "bg-accent/10" },
    { id: 2, title: "Nuevas Cuotas Detectadas", message: "Las cuotas para el partido del Real Madrid vs Valencia han sido actualizadas con valor a favor del local.", time: "Hace 1 hora", icon: Zap, color: "text-[#d9f95d]", bg: "bg-[#d9f95d]/10" },
    { id: 3, title: "Análisis IA Listo", message: "El análisis profundo para la jornada de Premier League de mañana ya está disponible en tu panel.", time: "Hace 3 horas", icon: Trophy, color: "text-primary", bg: "bg-primary/10" }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="relative p-2 text-textMuted hover:text-white transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unread && <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full animate-pulse"></span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0b0c10] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#131418]">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#d9f95d]" /> Notificaciones
            </h3>
            <button onClick={() => setIsOpen(false)} className="text-textMuted hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="max-h-[350px] overflow-y-auto scrollbar-hide">
            {notifications.map(notif => {
              const Icon = notif.icon;
              return (
                <div key={notif.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer flex gap-4 group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.bg} ${notif.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1 group-hover:text-[#d9f95d] transition-colors">{notif.title}</h4>
                    <p className="text-xs text-textMuted leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] font-medium text-textMuted/50 mt-2 block">{notif.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="p-3 text-center bg-[#131418] hover:bg-white/5 transition-colors cursor-pointer">
            <span className="text-xs font-bold text-[#d9f95d]">Ver todas las notificaciones</span>
          </div>
        </div>
      )}
    </div>
  );
}
