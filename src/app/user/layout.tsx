"use client";

import React from 'react';
import { useUserStore } from '@/store/useUserStore';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, BarChart3, Award, Settings, Wallet, Home, Crown, Milestone } from 'lucide-react';
import { UserBadge } from '@/components/user/UserBadge';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  const returnToHome = () => {
    router.push('/');
  }

  if (!user) return null; // 또는 로그인 유도 컴포넌트

  // 내비게이션 메뉴 구성
  const navItems = [
    { name: '프로필 홈', href: '/user', icon: <User size={18} /> },
    { name: '게임 전적', href: '/user/status', icon: <BarChart3 size={18} /> },
    { name: '업적', href: '/user/achievements', icon: <Award size={18} /> },
    { name: '칭호', href: '/user/titles', icon: <Crown size={18} /> },
    { name: '설정', href: '/user/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* 1. 상단 공통 히어로 영역 (선택 사항) */}
      <div className="bg-gradient-to-b from-blue-900/20 to-slate-950 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-600/20">
              <UserBadge nickname={user.nickname} title={user.activeTitle} color={user.titleColor} ></UserBadge>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">{user.nickname}</h1>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded border border-slate-700">
                  ID: {user.email.split('@')[0]}
                </span>
              </div>
              <div className="flex gap-4 mt-2 text-sm">
                <span className="flex items-center gap-1 text-white font-medium">
                  <Milestone size={14} /> Lv.{user.astat.level.toLocaleString()}
                </span>
                <span className="text-slate-500">|</span>
                <span className="text-slate-400">가입일: {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            {/* 홈으로 돌아가기 버튼 */}
            <button 
                onClick={returnToHome}
                className="ml-auto flex items-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl transition-all group"
            >
                <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:animate-ping" />
                <span className="text-xs font-bold text-slate-400 group-hover:text-white uppercase tracking-tighter">
                    Return Home
                </span>
                <Home size={16} className="text-slate-500 group-hover:text-blue-400" />
            </button>
          </div>

          {/* 2. 내비게이션 탭 */}
          <nav className="flex gap-1 mt-10">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-6 py-3 rounded-t-xl font-medium transition-all relative ${
                        isActive 
                        ? 'bg-slate-900 border-t border-l border-r border-slate-800 text-blue-400' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'
                    }`}
                    >
                    {item.icon}
                    {item.name}
                    {/* 활성화 시 하단 라인을 가려 콘텐츠 영역과 연결된 느낌 전달 */}
                    {isActive && (
                        <div className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-slate-900 z-10" />
                    )}
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