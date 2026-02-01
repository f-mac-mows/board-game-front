"use client";

import { useEffect, useState, useTransition } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useRouter } from 'next/navigation';
import FloatingDice from '@/components/home/FloatingDice';
import { authApi } from '@/api/auth';
import { Trophy, User, Loader2 } from 'lucide-react';

export default function HomePage() {
  // 1. Selector 최적화: 필요한 값만 선택적으로 구독하여 불필요한 리렌더링 방지
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);
  
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition(); // 이동 연산 최적화
  const router = useRouter();

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

  // 2. 안전한 내비게이션 함수
  const navigateTo = (href: string) => {
    startTransition(() => {
      router.push(href);
    });
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <main className="min-h-screen bg-slate-900"></main>;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4 overflow-hidden">
      <div className="relative text-center space-y-6 max-w-2xl z-10">
        <div className='space-y-2'>
          <h1 className="text-7xl font-black tracking-tighter text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            Board Game
          </h1>
          <p className="text-xl text-slate-400 font-medium">보드게임 플랫폼</p>
        </div>

        <div className="py-16 flex justify-center gap-6 lg:gap-10">
          <FloatingDice/><FloatingDice/><FloatingDice/><FloatingDice/><FloatingDice/>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-4 justify-center pt-4">
          {user ? (
            <div className="flex flex-col items-center gap-4">
              <button 
                onClick={() => navigateTo('/user')}
                disabled={isPending}
                className="group relative flex items-center gap-4 p-4 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700 rounded-2xl transition-all hover:scale-[1.02] text-left disabled:opacity-70"
              >
                <div className="w-16 h-15 bg-blue-600 rounded-full flex items-center justify-center border-2 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover:rotate-12 transition-transform">
                  {isPending ? <Loader2 className="animate-spin" size={32} /> : <User size={32} />}
                </div>
                
                <div className="pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-white">{user.nickname}님 환영합니다!</span>
                  </div>
                  <p className="text-sm text-slate-400 font-medium tracking-tight">
                    {isPending ? "페이지 분석 중..." : "마이페이지 관리 및 설정"}
                  </p>
                </div>

                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-blue-400">→</span>
                </div>
              </button>
              <div className="flex gap-2">
                <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
                  <span className="text-red-500 font-bold">⚜️ Lv.{user.astat.level.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
                  <span className="text-yellow-500 font-bold">💰 {user.asset.gold.toLocaleString()} gold</span>
                </div>
                <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-2">
                  <span className="text-blue-400 font-bold">🅿️ {user.asset.point} pts</span>
                </div>
                {/* 업적 버튼 */}
                <button 
                  onClick={() => navigateTo('/user/achievements')}
                  disabled={isPending}
                  className="px-4 py-2 bg-emerald-900/30 border border-emerald-500/30 hover:border-emerald-500 rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Trophy size={14} className="text-emerald-400" />
                  <span className="text-emerald-400 font-bold text-sm">업적</span>
                </button>
              </div>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => navigateTo('/rooms')}
                  disabled={isPending}
                  className="px-10 py-4 bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all rounded-full font-bold shadow-xl shadow-blue-600/20 disabled:bg-blue-800"
                >
                  {isPending ? "이동 중..." : "게임 로비 입장"}
                </button>
                <button 
                  onClick={handleLogout}
                  className="px-6 py-4 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-medium transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </div>
          ) : (
             <div className="flex gap-4">
                <button onClick={() => navigateTo('/auth/login')} className="px-10 py-4 bg-blue-600 hover:bg-blue-500 hover:scale-105 transition-all rounded-full font-bold shadow-xl shadow-blue-600/20">로그인</button>
                <button onClick={() => navigateTo('/auth/signup')} className="px-10 py-4 bg-slate-700 hover:bg-slate-600 transition-all rounded-full font-bold">회원가입</button>
             </div>
          )}
        </div>
      </div>

      {/* 하단 특징 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-20 text-sm text-slate-500 z-10">
        {[
          { title: "실시간 대전", desc: "Spring Boot 기반의 빠른 매칭" },
          { title: "랭킹 시스템", desc: "승리하여 MMR을 올리세요" },
          { title: "전략적 플레이", desc: "최고의 선택을 하세요" }
        ].map((item, idx) => (
          <div key={idx} className="p-5 border border-slate-800/50 bg-slate-900/50 backdrop-blur-sm rounded-2xl hover:border-slate-700 transition-colors">
            <h3 className="font-bold text-slate-300 mb-1">{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}