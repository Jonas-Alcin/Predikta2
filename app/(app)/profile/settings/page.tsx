import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "@/components/profile/SettingsForm";

export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const email = user?.email || "";
  const name = user?.user_metadata?.full_name || user?.user_metadata?.username || "";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile" className="p-2 rounded-full hover:bg-white/10 text-textMuted hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-white">Ajustes de Cuenta</h1>
      </div>

      <SettingsForm initialName={name} email={email} />
    </div>
  );
}
