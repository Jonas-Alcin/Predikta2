import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import MobileNav from "@/components/layout/MobileNav";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 flex flex-col">
          <div className="flex-1">
            {children}
          </div>
          <footer className="mt-12 pt-6 border-t border-white/5 text-center text-[11px] text-[#666666] px-4 shrink-0">
            <p>⚠️ <strong className="text-[#888888]">Juega con responsabilidad.</strong> Las apuestas deportivas conllevan riesgos financieros y pueden generar adicción.</p>
            <p className="mt-1">Por favor, controla tus gastos y apuesta solo dinero que puedas permitirte perder. Exclusivo para mayores de 18 años.</p>
          </footer>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
