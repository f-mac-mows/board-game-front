"use client";

import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import Link from 'next/link';

export default function HomePage() {
  const { user } = useUserStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <main className="min-h-screen bg-slate-900"></main>;
  }

  return (
    <main className="min-h-screan flex flex-col items-center justify-center bg-slate-900 text-white p-4">
      <div className="text-center space-y-6 max-w-2xl">
        {/* 로고 및 타이틀 영역 */}
        <div className='space-y-2'>
          <h1 className="text-6xl font-black tracking-tighter text-blue-500">
            Board Game
          </h1>
          <p className="text-xl text-slate-400">
            보드게임 플랫폼
          </p>
        </div>

        {/* 주사위 시각 효과 */}
        <div className="py-12 flex justify-center gap-4 text-4xl animate-bounce">
          <span>🎲</span><span>🎲</span><span>🎲</span><span>🎲</span><span>🎲</span>
        </div>

        <div className="flex gap-4 justify-center">
          {user ? (
            // 로그인 상태일 때
            <>
              <div className="flex flex-col items-center gap-2">
                <div className="px-6 py-3 bg-slate-800 rounded-xl border border-slate-700">
                  <span className="text-green-400 font-bold">⭐️ {user.nickname}님 환영합니다!</span>
                </div>
                <div className="px-6 py-3 bg-slate-800 rounded-xl border border-slate-700">
                  <span className="text-yellow-500 font-bold">💰 {user.asset.gold.toLocaleString()}</span>
                  <span className="mx-2">|</span>
                  <span className="text-blue-400 font-bold">🏆 {user.stat.mmr} MMR</span>
                </div>
                <Link href="/rooms" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-bold">
                  게임 로비 입장
                </Link>
                <button 
                  onClick={() => useUserStore.getState().clearUser()}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-full text-sm font-medium"
                >
                  로그아웃
                </button>
              </div>
            </>
          ) : (
            // 로그아웃 상태일 때
            <>
              <Link href="/auth/login" className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-bold">
                로그인
              </Link>
              <Link href="/auth/signup" className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-full font-bold">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
      {/* 게임 특징 요약 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 text-sm text-slate-500">
        <div className="p-4 border border-slate-800 rounded-xl">
          <h3 className="font-bold text-slate-300 mb-1">실시간 대전</h3>
          <p>Spring Boot 기반의 빠른 매칭</p>
        </div>
        <div className="p-4 border border-slate-800 rounded-xl">
          <h3 className="font-bold text-slate-300 mb-1">랭킹 시스템</h3>
          <p>승리하여 MMR을 올리세요</p>
        </div>
        <div className="p-4 border border-slate-800 rounded-xl">
          <h3 className="font-bold text-slate-300 mb-1">다양한 게임</h3>
          <p>당신의 전략을 펼치세요</p>
        </div>
      </div>
    </main>
  )
}