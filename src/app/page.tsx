"use client";

import { useEffect, useState, useTransition } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import FloatingDice from '@/components/home/FloatingDice';
import { authApi } from '@/api/auth';
import { useQuests } from '@/hooks/useQuests';
import { User, Loader2, LogOut, ChevronRight, Gamepad2, CheckCircle, ScrollText, Menu, X } from 'lucide-react';
import { UserBadge } from '@/components/user/UserBadge';

export default function HomePage() {
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 모바일 사이드바 상태
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { quests, isLoading: isQuestLoading } = useQuests();
  const topQuests = quests?.slice(0, 3) || [];

  const handleLogout = async () => {
    try { await authApi.logout(); } catch (err) { console.error(err); }
    finally {
      clearUser();
      localStorage.clear();
      window.location.href = "/";
    }
  };

  const navigateTo = (href: string) => {
    setIsSidebarOpen(false); // 이동 시 사이드바 닫기
    startTransition(() => {
      router.push(href);
    });
  };

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return <main className="min-h-screen bg-slate-950"></main>;

  return (
    <main className="min-h-screen flex bg-slate-950 text-white overflow-x-hidden relative">
      
      {/* 1. 모바일 햄버거 버튼 (lg 미만에서만 표시) */}
      <button 
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed top-6 left-6 z-40 p-3 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl text-blue-500 shadow-2xl"
      >
        <Menu size={24} />
      </button>

      {/* 2. [좌측] 프로필 사이드바 - 반응형 클래스 추가 */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-[320px] sm:w-95 border-r border-slate-800/50 bg-slate-900 lg:bg-slate-900/20 backdrop-blur-3xl p-10 
        flex flex-col justify-between transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="space-y-10">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Player Status</span>
            {/* 모바일 닫기 버튼 */}
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-500"><X size={20}/></button>
            <div className="hidden lg:flex gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            </div>
          </div>

          {user ? (
            <div className="space-y-8">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="relative group w-20 h-20 lg:w-24 lg:h-24">
                  <div className="absolute inset-0 bg-blue-500 rounded-4xl blur-2xl opacity-20 transition-opacity"></div>
                  <div className="relative w-full h-full bg-slate-800 border border-slate-700 rounded-4xl flex items-center justify-center">
                    <User size={40} className="text-blue-500" />
                  </div>
                </div>
                <div className="space-y-1 text-2xl lg:text-3xl font-black tracking-tight">
                  <UserBadge nickname={user.nickname} title={user.activeTitle} color={user.titleColor} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 bg-slate-800/30 rounded-2xl border border-white/5 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">LV</span>
                  <span className="text-lg font-mono font-black italic">{user.astat.level}</span>
                </div>
              </div>

              {/* 미니 퀘스트 섹션 */}
              <div className="w-full space-y-4 pt-2">
                <div className="flex items-center justify-between px-1 text-xs">
                  <h3 className="font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ScrollText size={14} className="text-blue-500" /> Daily Missions
                  </h3>
                  <button onClick={() => navigateTo('/quest')} className="text-blue-500 hover:text-blue-400 font-bold flex items-center">
                    VIEW ALL <ChevronRight size={12} />
                  </button>
                </div>
                <div className="space-y-2">
                  {topQuests.map((q: any) => (
                    <div key={q.id} className="p-4 bg-slate-900/50 border border-white/5 rounded-2xl space-y-2 text-xs">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-200">{q.title}</span>
                        {q.isClaimed && <CheckCircle size={14} className="text-emerald-500" />}
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all" style={{ width: `${(q.currentValue / q.targetValue) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button onClick={() => navigateTo('/user')} className="w-full flex items-center justify-between p-5 bg-slate-800 text-white rounded-2xl font-black text-xs hover:bg-blue-600 transition-all">
                  MY DASHBOARD <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6 pt-10">
              <p className="text-slate-500 font-medium text-sm leading-relaxed">로그인하여 여정을 시작하세요.</p>
              <div className="flex flex-col gap-3">
                <button onClick={() => navigateTo('/auth/login')} className="w-full py-4 bg-blue-600 rounded-2xl font-black">SIGN IN</button>
              </div>
            </div>
          )}
        </div>
        
        {user && (
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 font-black text-sm mt-10">
            <LogOut size={18} /> <span>LOGOUT</span>
          </button>
        )}
      </aside>

      {/* 3. 모바일용 오버레이 (사이드바 열렸을 때 배경) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 4. [중앙/우측] 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-8 relative min-h-screen overflow-y-auto">
        <div className="relative text-center space-y-6 lg:space-y-12 max-w-full lg:max-w-3xl z-10 py-20 lg:py-0">
          <div className='space-y-3'>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-blue-500 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)] italic">
              BOARD GAME
            </h1>
            <p className="text-sm lg:text-xl text-slate-400 font-medium tracking-widest uppercase px-4">왈렁이의 Board Platform</p>
          </div>

          {/* 주사위 (모바일에서는 간격 및 크기 조절) */}
          <div className="py-6 lg:py-10 flex justify-center gap-2 lg:gap-8 scale-75 lg:scale-100">
            <FloatingDice/><FloatingDice/><FloatingDice className="hidden xs:block"/><FloatingDice className="hidden sm:block"/><FloatingDice className="hidden md:block"/>
          </div>

          <div className="flex flex-col items-center gap-6 w-full px-4">
            <button 
              onClick={() => navigateTo('/rooms')}
              className="w-full lg:w-auto group px-12 lg:px-16 py-5 bg-blue-600 rounded-2xl font-black text-xl lg:text-2xl shadow-xl flex items-center justify-center gap-3"
            >
              {isPending ? <Loader2 className="animate-spin" /> : <Gamepad2 size={28} />}
              {isPending ? "이동 중..." : "GAME START"}
            </button>

            {/* 특징 섹션 (모바일에서 폰트 크기 조정) */}
            <div className="grid grid-cols-3 gap-4 lg:gap-6 pt-8 text-[10px] lg:text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              <div className="flex flex-col items-center gap-2 text-center leading-tight"><span>실시간 대전</span></div>
              <div className="flex flex-col items-center gap-2 text-center leading-tight"><span>랭킹 시스템</span></div>
              <div className="flex flex-col items-center gap-2 text-center leading-tight"><span>전략 플레이</span></div>
            </div>

            <footer className="w-full pt-10 flex flex-col items-center gap-4 text-center">
              <div className="h-px w-full bg-linear-to-r from-transparent via-slate-800 to-transparent mb-2" />
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] font-bold tracking-widest uppercase">
                <button onClick={() => navigateTo('/terms')} className="text-slate-500">Terms</button>
                <button onClick={() => navigateTo('/privacy')} className="text-slate-400">Privacy</button>
                <button onClick={() => navigateTo('/cookie')} className="text-slate-500">Cookie</button>
              </div>
              <p className="text-[9px] text-slate-700 uppercase tracking-tighter">© 2026 WALRUNG. All rights reserved.</p>
            </footer>
          </div>
        </div>
      </div>
    </main>
  );
}