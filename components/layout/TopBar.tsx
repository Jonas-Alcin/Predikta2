import { Search, LogOut, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/login/actions";
import NotificationBell from "./NotificationBell";

export default async function TopBar() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="h-16 border-b border-border glass-panel flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      <div className="flex-1 max-w-xl hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar equipos, partidos, o ligas..."
            className="w-full bg-surface border border-border rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder:text-textMuted focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
          />
        </div>
      </div>

      <div className="flex md:hidden items-center">
        <span className="text-xl font-bold tracking-tight text-white">Predikta</span>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        <NotificationBell hasUser={!!user} />

        {user ? (
          <div className="flex items-center gap-3">
            <Link href="/profile" className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary p-[2px] hidden md:block hover:scale-105 transition-transform cursor-pointer">
              <div className="w-full h-full rounded-full bg-surface border border-transparent overflow-hidden flex items-center justify-center">
                {/* Fallback avatar until profile table is hooked up */}
                <UserIcon className="w-4 h-4 text-textMuted" />
              </div>
            </Link>
            
            <form action={logout}>
              <button 
                type="submit" 
                className="flex items-center gap-2 text-sm font-medium text-textMuted hover:text-danger transition-colors p-2"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Salir</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-sm font-medium text-textMuted hover:text-white transition-colors"
            >
              Entrar
            </Link>
            <Link 
              href="/signup" 
              className="text-sm font-medium bg-primary text-white px-4 py-1.5 rounded-full hover:bg-primary/90 transition-colors"
            >
              Registro
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
