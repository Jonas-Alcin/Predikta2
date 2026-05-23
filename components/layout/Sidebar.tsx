import Link from "next/link";
import { Home, Trophy, Activity, User, LayoutDashboard } from "lucide-react";

const navItems = [
  { name: "Panel Principal", href: "/dashboard", icon: LayoutDashboard },
  { name: "Partidos", href: "/matches", icon: Activity },
  { name: "Mi Perfil", href: "/profile", icon: User },
];

export default function Sidebar() {
  return (
    <aside className="w-64 glass-panel hidden md:flex flex-col border-r border-border h-full">
      <div className="p-6 flex items-center gap-3">
        <Trophy className="text-primary w-8 h-8" />
        <span className="text-2xl font-bold tracking-tight text-white">Predikta</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-textMain hover:bg-white/5 hover:text-white transition-all duration-200 group"
            >
              <Icon className="w-5 h-5 text-textMuted group-hover:text-primary transition-colors" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-border/50">
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-4 rounded-xl border border-primary/20 relative overflow-hidden">
          <h4 className="text-sm font-bold text-white relative z-10">Predikta Pro</h4>
          <p className="text-xs text-textMuted mt-1 relative z-10">Desbloquea todas las predicciones de IA</p>
          <Link href="/pro" className="mt-3 w-full bg-[#d9f95d] hover:bg-[#c8ea4f] text-black text-xs font-bold py-2 rounded-lg transition-colors relative z-10 block text-center uppercase tracking-wide">
            Mejorar Ahora
          </Link>
        </div>
      </div>
    </aside>
  );
}
