"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { RefreshCw, Check, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfileAvatar({ 
  currentSeed, 
  email, 
  name 
}: { 
  currentSeed: string; 
  email: string; 
  name: string; 
}) {
  const [seed, setSeed] = useState(currentSeed);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const generateNew = async () => {
    setLoading(true);
    const newSeed = Math.random().toString(36).substring(7);
    setSeed(newSeed);
    
    const supabase = createClient();
    await supabase.auth.updateUser({
      data: { avatar_seed: newSeed }
    });
    
    setLoading(false);
    setSaved(true);
    router.refresh();
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col items-center relative w-full">
      <div className="relative w-28 h-28 rounded-full bg-[#131418] border-4 border-[#d9f95d]/20 overflow-hidden mt-8 mb-4 shadow-[0_0_20px_rgba(217,249,93,0.1)] group">
        <img 
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=d9f95d,131418`} 
          alt="Profile Avatar" 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
        />
        
        <button 
          onClick={generateNew}
          disabled={loading}
          className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          {loading ? (
            <RefreshCw className="w-8 h-8 text-[#d9f95d] animate-spin" />
          ) : (
            <>
              <ImageIcon className="w-6 h-6 text-[#d9f95d] mb-1" />
              <span className="text-[10px] text-white font-bold uppercase tracking-wider">Cambiar</span>
            </>
          )}
        </button>
      </div>
      
      <h2 className="text-xl md:text-2xl font-bold text-white mb-1 tracking-tight">{name}</h2>
      <p className="text-sm text-textMuted mb-5 font-mono bg-white/5 px-3 py-1 rounded-md">{email}</p>
      
      {saved && (
        <div className="absolute top-4 right-4 bg-[#d9f95d] text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 animate-in fade-in slide-in-from-top-2 shadow-lg z-10">
          <Check className="w-3 h-3" /> ¡Avatar actualizado!
        </div>
      )}
    </div>
  );
}
