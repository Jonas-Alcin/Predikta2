import { Check, Star, Zap, Crown, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ProPage() {
  return (
    <div className="animate-in fade-in duration-500 max-w-6xl mx-auto px-4 py-8">
      
      {/* Hero Section */}
      <div className="text-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#d9f95d]/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
        <Crown className="w-16 h-16 text-[#d9f95d] mx-auto mb-6 drop-shadow-[0_0_15px_rgba(217,249,93,0.5)]" />
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Desbloquea el Poder Total de la IA</h1>
        <p className="text-lg text-textMuted max-w-2xl mx-auto">
          Pasa al siguiente nivel con Predikta Pro. Obtén predicciones exclusivas, análisis en tiempo real y cuotas de alto valor antes que nadie.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        
        {/* Free Tier */}
        <div className="glass-panel border border-white/10 rounded-3xl p-8 flex flex-col opacity-80 hover:opacity-100 transition-opacity">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-white mb-2">Básico</h3>
            <p className="text-textMuted">Ideal para empezar a explorar.</p>
          </div>
          <div className="mb-8">
            <span className="text-5xl font-black text-white">Gratis</span>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-textMuted shrink-0 mt-0.5" />
              <span className="text-textMuted">Acceso a 3 predicciones seguras por día</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-textMuted shrink-0 mt-0.5" />
              <span className="text-textMuted">Cuotas estándar de las principales ligas</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-textMuted shrink-0 mt-0.5" />
              <span className="text-textMuted">Estadísticas H2H básicas</span>
            </li>
          </ul>

          <button className="w-full py-4 rounded-xl font-bold text-textMuted bg-white/5 cursor-not-allowed">
            Plan Actual
          </button>
        </div>

        {/* Pro Tier */}
        <div className="glass-panel border-2 border-[#d9f95d] rounded-3xl p-8 flex flex-col relative transform hover:-translate-y-2 transition-transform duration-300 shadow-[0_0_40px_rgba(217,249,93,0.15)]">
          <div className="absolute top-0 right-8 -translate-y-1/2">
            <span className="bg-[#d9f95d] text-black text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider">
              Más Popular
            </span>
          </div>
          
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-[#d9f95d] mb-2 flex items-center gap-2">
              <Star className="w-6 h-6 fill-[#d9f95d]" /> Predikta Pro
            </h3>
            <p className="text-white/80">Para apostadores que van en serio.</p>
          </div>
          
          <div className="mb-8 flex items-baseline gap-2">
            <span className="text-5xl font-black text-white">$14.99</span>
            <span className="text-textMuted">/mes</span>
          </div>
          
          <ul className="space-y-4 mb-8 flex-1">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#d9f95d] shrink-0 mt-0.5" />
              <span className="text-white font-medium">Predicciones ilimitadas 24/7</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#d9f95d] shrink-0 mt-0.5" />
              <span className="text-white font-medium">Fichas de Alto Riesgo generadas por IA</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#d9f95d] shrink-0 mt-0.5" />
              <span className="text-white font-medium">Alertas en vivo de caídas de cuotas</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#d9f95d] shrink-0 mt-0.5" />
              <span className="text-white font-medium">Análisis avanzado (xG, Árbitros, Lesiones)</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-[#d9f95d] shrink-0 mt-0.5" />
              <span className="text-white font-medium">Soporte prioritario VIP</span>
            </li>
          </ul>

          <button className="w-full py-4 rounded-xl font-bold text-black bg-[#d9f95d] hover:bg-[#c8ea4f] transition-colors shadow-lg flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 fill-black" /> Suscribirse Ahora
          </button>
        </div>
      </div>
      
      {/* Money back guarantee */}
      <div className="mt-16 flex items-center justify-center gap-2 text-textMuted">
        <ShieldCheck className="w-5 h-5 text-white/50" />
        <span className="text-sm">Garantía de devolución de dinero de 7 días. Cancela cuando quieras.</span>
      </div>
      
    </div>
  );
}
