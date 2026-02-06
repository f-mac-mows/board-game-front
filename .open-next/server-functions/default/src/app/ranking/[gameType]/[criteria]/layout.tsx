"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Home, Trophy } from 'lucide-react';

export default function RankingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* 상단 헤더 영역 (UserLayout과 디자인 톤 매칭) */}
      <div className="bg-linear-to-b from-blue-900/20 to-slate-950 border-b border-slate-800/50">
        <div className="max-w-5xl mx-auto px-6 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            
            {/* 랭킹 페이지 타이틀 */}
            <div className="flex flex-col items-center lg:items-start space-y-2">
              <div className="flex items-center gap-3 text-blue-500">
                <Trophy size={24} className="animate-pulse" />
                <span className="text-xs font-black uppercase tracking-[0.3em]">Hall of Fame</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase">Leaderboard</h1>
              <p className="text-slate-500 text-sm font-medium italic">최고의 실력을 가진 플레이어들을 확인하세요.</p>
            </div>

            {/* 홈으로 돌아가기 버튼 (UserLayout과 동일 스타일) */}
            <button 
                onClick={() => router.push('/')}
                className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all group active:scale-95 shadow-xl"
            >
                <Home size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
                <span className="text-xs font-black text-slate-500 group-hover:text-white uppercase tracking-[0.2em]">
                    Return Lobby
                </span>
            </button>
          </div>
        </div>
      </div>

      {/* 메인 랭킹 콘텐츠 */}
      <main className="max-w-5xl mx-auto px-6 py-8 lg:py-12 animate-in fade-in slide-in-from-bottom-3 duration-700">
        {children}
      </main>
    </div>
  );
}