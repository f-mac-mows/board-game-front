"use client";

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import Link from 'next/link';
import FloatingDice from '@/components/home/FloatingDice';
import { authApi } from '@/api/auth';

export default function HomePage() {
  const { user, clearUser } = useUserStore();
  const [mounted, setMounted] = useState(false);

  const handleLogout = async () => {
      try {
          await authApi.logout(); 
      } catch (err) {
          console.error("서버 로그아웃 통신 실패 (이미 만료되었을 수 있음):", err);
      } finally {
          clearUser();
          localStorage.clear();
          window.location.href = "/";
      }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <main className="min-h-screen bg-slate-900"></main>;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-4 overflow-hidden">
      <div className="relative text-center space-y-6 max-w-2xl z-10">
        {/* 타이틀 영역 */}
        <div className='space-y-2'>
          <h1 className="text-7xl font-black tracking-tighter text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            Board Game
          </h1>
          <p className="text-xl text-slate-400 font-medium">
            보드게임 플랫폼
          </p>
        </div>

        {/* ✨ 주사위 시각 효과 (3D 애니메이션 적용) */}
        <div className="py-16 flex justify-center gap-6 lg:gap-10">
          <FloatingDice/>
          <FloatingDice/>
          <FloatingDice/>
          <FloatingDice/>
          <FloatingDice/>
        </div>

        {/* 버튼 영역 */}
        <div className="flex gap-4 justify-center pt-4">
          {user ? (
            <div className="flex flex-col items-center gap-4">
              <div className="px-6 py-3 bg-slate-800 rounded-xl border border-slate-700">
                  <span className="text-green-400 font-bold">⭐️ {user.nickname}님 환영합니다!</span>
              </div>
              <div className="flex gap-3">
                <div className="px-4 py-2 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700">
                  <span className="text-yellow-500 font-bold">💰 {user.asset.gold.toLocaleString()}</span>
                </div>
                <div className="px-4 py-2 bg-slate-800/50 backdrop-blur-md rounded-xl border border-slate-700">
                  <span className="text-blue-400 font-bold">🏆 {user.stats.length} MMR</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Link href="/rooms" className="px-10 py-4 bg-blue-600 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all rounded-full font-bold shadow-xl shadow-blue-600/20">
                  게임 로비 입장
                </Link>
                <button 
                  onClick={handleLogout}
                  className="px-6 py-4 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-medium transition-colors"
                >
                  로그아웃
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="px-10 py-4 bg-blue-600 hover:bg-blue-500 hover:scale-105 transition-all rounded-full font-bold shadow-xl shadow-blue-600/20">
                로그인
              </Link>
              <Link href="/auth/signup" className="px-10 py-4 bg-slate-700 hover:bg-slate-600 transition-all rounded-full font-bold">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>

      {/* 배경 장식 (선택 사항) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-0" />

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