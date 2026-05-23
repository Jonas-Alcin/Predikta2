import { Settings, LogOut, Award, History, Bookmark } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProfileAvatar from "@/components/profile/ProfileAvatar";
import { getAnalysisHistory } from "@/app/actions/db";

export default async function ProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const email = user?.email || "usuario@ejemplo.com";
  const name = user?.user_metadata?.full_name || user?.user_metadata?.username || email.split("@")[0];
  const avatarSeed = user?.user_metadata?.avatar_seed || email;

  const history = await getAnalysisHistory();

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel border border-border rounded-3xl p-6 flex flex-col items-center text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
             
             <ProfileAvatar 
               currentSeed={avatarSeed} 
               email={email} 
               name={name} 
             />
             
             <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/30 rounded-full text-primary text-xs font-bold w-full justify-center">
               <Award className="w-4 h-4" /> Miembro Pro
             </div>
          </div>

          <div className="glass-panel border border-border rounded-2xl p-4">
             <div className="space-y-1">
               <Link href="/profile/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-textMain hover:bg-white/5 hover:text-white transition-all group">
                 <Settings className="w-5 h-5 text-textMuted group-hover:text-white" />
                 <span className="font-medium">Ajustes</span>
               </Link>
               <form action={async () => {
                 "use server";
                 const { logout } = await import("@/app/login/actions");
                 await logout();
               }}>
                 <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-danger hover:bg-danger/10 transition-all group">
                   <LogOut className="w-5 h-5" />
                   <span className="font-medium">Cerrar sesión</span>
                 </button>
               </form>
             </div>
          </div>
        </div>

        {/* Saved Bets & History */}
        <div className="md:col-span-2 space-y-6">


          <div className="glass-panel border border-border rounded-3xl p-6">
             <div className="flex items-center gap-2 mb-6">
               <History className="text-textMuted w-5 h-5" />
               <h3 className="text-lg font-bold text-white">Historial de Análisis</h3>
             </div>

             <div className="space-y-4">
               {history.length === 0 ? (
                 <div className="text-center py-8">
                   <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                     <History className="text-textMuted w-8 h-8 opacity-50" />
                   </div>
                   <h4 className="text-white font-medium mb-1">No hay análisis recientes</h4>
                   <p className="text-sm text-textMuted max-w-sm mx-auto">
                     Tus predicciones vistas y el historial de análisis de IA aparecerán aquí.
                   </p>
                 </div>
               ) : (
                 history.map((item) => (
                   <Link href={`/predictions/${item.fixture_id}`} key={item.id} className="block bg-surface border border-transparent hover:border-border rounded-xl p-4 transition-colors group">
                     <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="w-full md:w-auto">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-white/5 px-2 py-0.5 rounded text-textMuted">{item.league_name}</span>
                            <span className="text-xs text-textMuted">{new Date(item.created_at).toLocaleString()}</span>
                          </div>
                          <div className="font-bold text-white text-sm">{item.team_home} vs {item.team_away}</div>
                        </div>
                     </div>
                   </Link>
                 ))
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
