"use client";

import { useEffect, useState, useTransition } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import FloatingDice from '@/components/home/FloatingDice';
import { authApi } from '@/api/auth';
import { useQuests } from '@/hooks/useQuests';
import { User, Loader2, LogOut, ChevronRight, Gamepad2, CheckCircle, ScrollText, Gift } from 'lucide-react';
import { UserBadge } from '@/components/user/UserBadge';

export default function HomePage() {
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { quests, isLoading: isQuestLoading, claimReward } = useQuests();
  const topQuests = quests?.slice(0, 3) || []; // 상위 3개만 표시

  const handleLogout = async () => {
    try {
      await authApi.logout(); 
    } catch (err) {
      console.error("서버 로그아웃 통신 실패:", err);
    } finally {
      clearUser();
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const navigateTo = (href: string) => {
    startTransition(() => {
      router.push(href);
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <main className="min-h-screen bg-slate-950"></main>;

  return (
    <main className="min-h-screen flex bg-slate-950 text-white overflow-hidden">
      {/* [좌측] 프로필 사이드바 */}
      <aside className="w-[380px] border-l border-slate-800/50 bg-slate-900/20 backdrop-blur-3xl p-10 flex flex-col justify-between z-20">
        <div className="space-y-10">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Player Status</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            </div>
          </div>

          {user ? (
            <div className="space-y-8">
              {/* 프로필 메인 */}
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="relative group w-24 h-24">
                  <div className="absolute inset-0 bg-blue-500 rounded-[32px] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative w-24 h-24 bg-slate-800 border border-slate-700 rounded-[32px] flex items-center justify-center transition-transform group-hover:rotate-3">
                    <User size={48} className="text-blue-500" />
                  </div>
                </div>
                
                <div className="space-y-1 text-3xl font-black tracking-tight">
                  <UserBadge nickname={user.nickname} title={user.activeTitle} color={user.titleColor}></UserBadge>
                </div>
              </div>

              {/* 스탯 정보 */}
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 bg-slate-800/30 rounded-2xl border border-white/5 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">LV</span>
                  <span className="text-lg font-mono font-black italic">{user.astat.level}</span>
                </div>
                <div className="p-3 bg-slate-800/30 rounded-2xl border border-white/5 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Rank</span>
                  <span className="text-lg font-mono font-black italic text-green-400">#123</span>
                </div>
              </div>

              {/* 3. 미니 퀘스트 섹션 (DailyQuestPage 로직 적용) */}
              <div className="w-full space-y-4 pt-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ScrollText size={14} className="text-blue-500" /> Daily Missions
                  </h3>
                  <button 
                    onClick={() => navigateTo('/quest')}
                    className="text-[10px] font-bold text-blue-500 hover:text-blue-400 flex items-center gap-0.5 transition-colors"
                  >
                    VIEW ALL <ChevronRight size={12} />
                  </button>
                </div>

                <div className="space-y-2">
                  {isQuestLoading ? (
                    <div className="flex justify-center py-4"><Loader2 className="animate-spin text-slate-700" size={20} /></div>
                  ) : (
                    topQuests.map((q: any) => (
                      <div key={q.id} className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-slate-200 line-clamp-1">{q.title}</span>
                          {q.isClaimed && <CheckCircle size={14} className="text-emerald-500" />}
                        </div>
                        {/* 미니 프로그레스 바 */}
                        <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`absolute h-full transition-all duration-700 ${q.completed ? 'bg-emerald-500' : 'bg-blue-500'}`}
                            style={{ width: `${(q.currentValue / q.targetValue) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 내비게이션 버튼 */}
              <div className="space-y-3 pt-4">
                <button 
                  onClick={() => navigateTo('/user')}
                  className="w-full flex items-center justify-between p-5 bg-slate-700 text-white rounded-2xl font-black text-sm hover:bg-blue-500 hover:text-white transition-all group"
                >
                  MY DASHBOARD
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-slate-500 font-medium leading-relaxed">
                보드게임의 세계에 오신 것을 환영합니다. <br/>로그인하여 여정을 시작하세요.
              </p>
              <div className="flex flex-col gap-3">
                <button onClick={() => navigateTo('/auth/login')} className="w-full py-4 bg-blue-600 rounded-2xl font-black hover:bg-blue-500 transition-all">SIGN IN</button>
                <button onClick={() => navigateTo('/auth/signup')} className="w-full py-4 bg-slate-800 rounded-2xl font-black hover:bg-slate-700 transition-all text-slate-300 text-sm">CREATE ACCOUNT</button>
              </div>
            </div>
          )}
        </div>
        <br/>
        {/* 하단 로그아웃 */}
        {user && (
          <div className="flex justify-start w-full"> 
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-500 hover:text-red-400 transition-colors font-black text-sm group"
            >
              <LogOut size={18} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="tracking-tighter">LOGOUT</span>
            </button>
          </div>
        )}
      </aside>
      {/* [우측/중앙] 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        <div className="relative text-center space-y-8 max-w-3xl z-10">
          <div className='space-y-3'>
            <h1 className="text-8xl font-black tracking-tighter text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)] italic">
              BOARD GAME
            </h1>
            <p className="text-xl text-slate-400 font-medium tracking-widest uppercase">왈렁이의 Board Platform</p>
          </div>

          {/* Three.js 주사위 배치 영역 */}
          <div className="py-10 flex justify-center gap-4 lg:gap-8 pointer-events-auto">
            <FloatingDice/><FloatingDice/><FloatingDice/><FloatingDice/><FloatingDice/>
          </div>

          <div className="flex flex-col items-center gap-6">
            <button 
              onClick={() => navigateTo('/rooms')}
              disabled={isPending}
              className="group relative px-16 py-5 bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all rounded-2xl font-black text-2xl shadow-[0_0_40px_rgba(59,130,246,0.3)] disabled:opacity-70 flex items-center gap-3"
            >
              {isPending ? <Loader2 className="animate-spin" /> : <Gamepad2 size={28} />}
              {isPending ? "이동 중..." : "GAME START"}
            </button>

            {/* 특징 섹션 (가로 배치) */}
            <div className="grid grid-cols-3 gap-6 pt-12 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              <div className="flex flex-col items-center gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
                실시간 대전
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
                랭킹 시스템
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span>
                전략 플레이
              </div>
            </div>

            {/* 중앙 하단 약관 및 카피라이트 섹션 */}
            <footer className="w-full max-w-2xl py-10 flex flex-col items-center gap-4 z-10">
              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-2" />
              
              <div className="flex gap-6 text-[11px] font-bold tracking-widest uppercase">
                <button 
                  onClick={() => navigateTo('/terms')} 
                  className="text-slate-500 hover:text-blue-400 transition-colors"
                >
                  Terms of Service
                </button>
                <button 
                  onClick={() => navigateTo('/privacy')} 
                  className="text-slate-400 hover:text-blue-400 transition-colors"
                >
                  Privacy Policy
                </button>
                <button 
                  onClick={() => navigateTo('/cookie')}
                  className="text-slate-500 hover:text-blue-400 transition-colors"
                >
                  Cookie Policy
                </button>
              </div>

              <div className="flex flex-col items-center gap-1">
                <p className="text-[10px] text-slate-600 font-medium tracking-tight">
                  © 2026 <span className="text-slate-500 font-bold">WALRUNG.</span> All rights reserved.
                </p>
                <p className="text-[9px] text-slate-700">
                  Board Platform for Strategy & Luck
                </p>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}