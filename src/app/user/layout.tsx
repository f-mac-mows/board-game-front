"use client";

import React from 'react';
import { useUserStore } from '@/store/useUserStore';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, BarChart3, Award, Settings, Wallet } from 'lucide-react';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUserStore();
  const pathname = usePathname();

  if (!user) return null; // 또는 로그인 유도 컴포넌트

  // 내비게이션 메뉴 구성
  const navItems = [
    { name: '프로필 홈', href: '/user', icon: <User size={18} /> },
    { name: '게임 전적', href: '/user/status', icon: <BarChart3 size={18} /> },
    { name: '업적 & 칭호', href: '/user/achievements', icon: <Award size={18} /> },
    { name: '설정', href: '/user/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* 1. 상단 공통 히어로 영역 (선택 사항) */}
      <div className="bg-gradient-to-b from-blue-900/20 to-slate-950 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-600/20">
              {user.nickname[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{user.nickname}</h1>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">
                  ID: {user.email.split('@')[0]}
                </span>
              </div>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1 text-yellow-500 font-medium">
                  <Wallet size={14} /> {user.asset.gold.toLocaleString()}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">가입일: {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* 2. 내비게이션 탭 */}
          <nav className="flex gap-1 mt-10">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-medium transition-all ${
                    isActive 
                      ? 'bg-slate-900 border-t border-l border-r border-slate-800 text-blue-400' 
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 3. 하위 페이지 콘텐츠 출력 영역 */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}