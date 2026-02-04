"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GAME_TYPE_CONFIG } from "@/types/rooms";
import { ChevronLeft, Home } from "lucide-react";

export default function WikiNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-8 overflow-x-auto">
        {/* 홈으로 돌아가기 */}
        <Link 
          href="/" 
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <Home size={18} />
          <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Back to Home</span>
        </Link>
          
        <Link 
          href="/wiki" 
          className={`text-sm font-black italic shrink-0 transition-colors ${
            pathname === "/wiki" ? "text-blue-500" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          WIKI HOME
        </Link>
        
        <div className="h-4 w-px bg-slate-800 shrink-0" />
        
        {Object.entries(GAME_TYPE_CONFIG).map(([key, detail]) => {
          const href = `/wiki/${key.toLowerCase()}`;
          const isActive = pathname === href;

          return (
            <Link 
              key={key}
              href={href}
              className="relative py-1 shrink-0"
            >
              <span className={`text-xs font-bold uppercase tracking-tighter transition-all duration-300 ${
                isActive ? "text-blue-400" : "text-slate-400 hover:text-slate-200"
              }`}>
                {detail.description}
              </span>
              
              {/* ✨ 하단 푸른색 바 + 글로우 효과 */}
              <div className={`absolute -bottom-4.25 left-0 right-0 h-0.75 transition-all duration-300 ${
                isActive 
                  ? "bg-blue-500 opacity-100 shadow-[0_0_12px_rgba(59,130,246,0.8),0_0_4px_rgba(59,130,246,0.4)]" 
                  : "bg-transparent opacity-0"
              }`} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}