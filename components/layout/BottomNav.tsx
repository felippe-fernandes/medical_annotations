"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Users, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 z-50 md:hidden">
      <div className="flex items-center justify-around h-16">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive("/dashboard")
              ? "text-blue-400 bg-blue-950"
              : "text-slate-400 hover:bg-slate-700"
          }`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Início</span>
        </Link>

        <Link
          href="/patients"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            isActive("/patients")
              ? "text-blue-400 bg-blue-950"
              : "text-slate-400 hover:bg-slate-700"
          }`}
        >
          <Users size={24} />
          <span className="text-xs mt-1">Pacientes</span>
        </Link>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex flex-col items-center justify-center flex-1 h-full transition-colors text-slate-400 hover:bg-slate-700 disabled:opacity-50"
        >
          <LogOut size={24} />
          <span className="text-xs mt-1">{isLoggingOut ? "Saindo..." : "Sair"}</span>
        </button>
      </div>
    </nav>
  );
}
