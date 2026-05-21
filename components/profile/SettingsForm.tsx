"use client";
import { useState } from "react";
import { Bell, Shield, User, Globe, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SettingsForm({ initialName, email }: { initialName: string, email: string }) {
  const [activeTab, setActiveTab] = useState<"perfil" | "seguridad" | "notificaciones" | "idioma">("perfil");
  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [aiAlerts, setAiAlerts] = useState(false);
  const router = useRouter();

  const handleSaveProfile = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name, username: name }
    });
    setLoading(false);
    
    if (!error) {
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      {/* Sidebar Settings Menu */}
      <div className="md:col-span-1 space-y-2">
        <button 
          onClick={() => setActiveTab("perfil")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-left transition-colors ${activeTab === "perfil" ? "bg-white/10 text-white" : "text-textMuted hover:bg-white/5 hover:text-white"}`}
        >
          <User className="w-5 h-5" /> Perfil
        </button>
        <button 
          onClick={() => setActiveTab("seguridad")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-left transition-colors ${activeTab === "seguridad" ? "bg-white/10 text-white" : "text-textMuted hover:bg-white/5 hover:text-white"}`}
        >
          <Shield className="w-5 h-5" /> Seguridad
        </button>
        <button 
          onClick={() => setActiveTab("notificaciones")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-left transition-colors ${activeTab === "notificaciones" ? "bg-white/10 text-white" : "text-textMuted hover:bg-white/5 hover:text-white"}`}
        >
          <Bell className="w-5 h-5" /> Notificaciones
        </button>
        <button 
          onClick={() => setActiveTab("idioma")}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-left transition-colors ${activeTab === "idioma" ? "bg-white/10 text-white" : "text-textMuted hover:bg-white/5 hover:text-white"}`}
        >
          <Globe className="w-5 h-5" /> Idioma
        </button>
      </div>

      {/* Content Area */}
      <div className="md:col-span-3 space-y-6">
        {activeTab === "perfil" && (
          <>
            <div className="glass-panel border border-border rounded-3xl p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-white mb-6">Información Personal</h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-2">Nombre Público</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre" 
                    className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#d9f95d]/50 transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-2">Correo Electrónico</label>
                  <input 
                    type="email" 
                    disabled
                    value={email}
                    className="w-full px-4 py-3 border border-white/5 rounded-xl bg-black/20 text-textMuted cursor-not-allowed"
                  />
                  <p className="text-xs text-textMuted mt-2">Para cambiar tu correo o contraseña, contacta al soporte técnico.</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-end gap-4">
                 {saved && (
                   <span className="text-[#d9f95d] text-sm font-bold flex items-center gap-1 animate-in fade-in">
                     <Check className="w-4 h-4" /> Guardado
                   </span>
                 )}
                 <button 
                   onClick={handleSaveProfile}
                   disabled={loading || !name}
                   className="bg-[#d9f95d] hover:bg-[#c8ea4f] disabled:opacity-50 text-black font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(217,249,93,0.2)] flex items-center gap-2"
                 >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Cambios"}
                 </button>
              </div>
            </div>

            <div className="glass-panel border border-border rounded-3xl p-6 md:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-bold text-white mb-6">Preferencias de Aplicación</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-white font-medium">Modo Oscuro Absoluto</h4>
                    <p className="text-sm text-textMuted">El diseño dark premium está activado por defecto.</p>
                  </div>
                  <div className="w-12 h-6 shrink-0 bg-[#d9f95d] rounded-full relative cursor-not-allowed opacity-80">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-black rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between border-t border-white/5 pt-6 gap-4">
                  <div>
                    <h4 className="text-white font-medium">Alertas de Inteligencia Artificial</h4>
                    <p className="text-sm text-textMuted">Recibir notificaciones cuando la IA detecte apuestas de altísimo valor.</p>
                  </div>
                  <div 
                    onClick={() => setAiAlerts(!aiAlerts)}
                    className={`w-12 h-6 shrink-0 rounded-full relative cursor-pointer transition-colors ${aiAlerts ? 'bg-[#d9f95d]' : 'bg-white/20'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform duration-200 ${aiAlerts ? 'bg-black translate-x-6' : 'bg-white translate-x-0'}`}></div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "seguridad" && (
          <div className="glass-panel border border-border rounded-3xl p-6 md:p-8 text-center py-16 animate-in fade-in slide-in-from-right-4 duration-300">
            <Shield className="w-12 h-12 text-[#d9f95d] mx-auto mb-4 opacity-80" />
            <h2 className="text-xl font-bold text-white mb-2">Seguridad Avanzada</h2>
            <p className="text-textMuted max-w-sm mx-auto">
              Tu cuenta está protegida por encriptación de nivel bancario gracias a Supabase. La autenticación en dos pasos (2FA) estará disponible próximamente en tu región.
            </p>
          </div>
        )}

        {activeTab === "notificaciones" && (
          <div className="glass-panel border border-border rounded-3xl p-6 md:p-8 text-center py-16 animate-in fade-in slide-in-from-right-4 duration-300">
            <Bell className="w-12 h-12 text-[#d9f95d] mx-auto mb-4 opacity-80" />
            <h2 className="text-xl font-bold text-white mb-2">Centro de Notificaciones</h2>
            <p className="text-textMuted max-w-sm mx-auto">
              Configura cómo y cuándo deseas recibir alertas urgentes sobre partidos y cuotas recomendadas. Módulo en desarrollo.
            </p>
          </div>
        )}

        {activeTab === "idioma" && (
          <div className="glass-panel border border-border rounded-3xl p-6 md:p-8 text-center py-16 animate-in fade-in slide-in-from-right-4 duration-300">
            <Globe className="w-12 h-12 text-[#d9f95d] mx-auto mb-4 opacity-80" />
            <h2 className="text-xl font-bold text-white mb-2">Idioma y Región</h2>
            <p className="text-textMuted max-w-sm mx-auto">
              Actualmente Predikta está 100% optimizado para Español. El soporte para idioma Inglés y Portugués llegará en la próxima actualización grande.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
