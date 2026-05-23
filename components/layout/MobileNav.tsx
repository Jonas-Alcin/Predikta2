"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, User } from "lucide-react";

const navItems = [
  { name: "Panel", href: "/dashboard", icon: Home },
  { name: "Partidos", href: "/matches", icon: Activity },
  { name: "Perfil", href: "/profile", icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-md border-t border-border z-50 px-2 sm:px-6">
      <nav className="flex items-center justify-between h-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? "text-primary" : "text-textMuted hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
