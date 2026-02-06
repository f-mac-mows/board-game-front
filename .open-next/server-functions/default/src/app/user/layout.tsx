"use client";

import React from 'react';
import { useUserStore } from '@/store/useUserStore';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, BarChart3, Award, Settings, Home, Crown, Milestone } from 'lucide-react';
import { UserBadge } from '@/components/user/UserBadge';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUserStore();
  const router = useRouter();
  const pathname = usePathname();

  if (!user) return null;

  const navItems = [
    { name: '프로필 홈', href: '/user', icon: <User size={18} /> },
    { name: '게임 전적', href: '/user/status', icon: <BarChart3 size={18} /> },
    { name: '업적', href: '/user/achievements', icon: <Award size={18} /> },
    { name: '칭호', href: '/user/titles', icon: <Crown size={18} /> },
    { name: '설정', href: '/user/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* 1. 상단 히어로 영역 */}
      <div className="bg-linear-to-b from-blue-900/20 to-slate-950 border-b border-slate-800/50">
        <div className="max-w-5xl mx-auto px-6 pt-12 lg:pt-16">
          <div className="flex flex-col lg:flex-row items-center lg:items-center gap-6 lg:gap-8">
            
            {/* 프로필 이미지 박스 */}
            <div className="relative group shrink-0">
              <div className="absolute inset-0 bg-blue-600 rounded-[2.5rem] blur-3xl opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative w-24 h-24 lg:w-28 lg:h-28 bg-slate-900 border border-slate-800 rounded-[2.5rem] flex items-center justify-center text-3xl shadow-2xl transition-transform group-hover:scale-[1.02]">
                <UserBadge nickname={user.nickname} title={user.activeTitle} color={user.titleColor} />
              </div>
            </div>

            {/* 유저 기본 정보 */}
            <div className="flex flex-col items-center lg:items-start space-y-3 flex-1 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row items-center gap-3">
                <h1 className="text-3xl lg:text-4xl font-black tracking-tighter uppercase">{user.nickname}</h1>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-500 px-3 py-1 rounded-lg border border-slate-700 uppercase tracking-wider">
                  ID: {user.email.split('@')[0]}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm font-bold">
                <span className="flex items-center gap-1.5 text-blue-500">
                  <Milestone size={16} /> LV.{user.astat.level.toLocaleString()}
                </span>
                <span className="w-px h-3 bg-slate-800" />
                <span className="text-slate-500 uppercase tracking-widest text-[11px]">
                  가입일: {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* 홈 버튼 - 모바일에서 하단 배치 방지를 위해 lg:ml-auto 유지 */}
            <button 
                onClick={() => router.push('/')}
                className="w-full lg:w-auto flex items-center justify-center gap-2 px-6 py-4 lg:py-3 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all group active:scale-95"
            >
                <Home size={16} className="text-slate-500 group-hover:text-blue-400" />
                <span className="text-xs font-black text-slate-500 group-hover:text-white uppercase tracking-widest">
                    Return Lobby
                </span>
            </button>
          </div>

          {/* 2. 내비게이션 탭 영역 (삐져나옴 방지 핵심) */}
          <div className="mt-12 relative">
            <div className="overflow-x-auto no-scrollbar -mx-6 px-6 lg:mx-0 lg:px-0">
              <nav className="flex flex-nowrap min-w-max border-b border-slate-800/50">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center gap-2 px-6 py-5 
                        font-black text-[11px] lg:text-xs uppercase tracking-[0.15em] transition-all relative whitespace-nowrap
                        ${isActive 
                          ? 'text-blue-500' 
                          : 'text-slate-500 hover:text-slate-300'
                        }
                      `}
                    >
                      {item.icon}
                      {item.name}
                      
                      {/* 활성화 언더라인 */}
                      {isActive && (
                        <div className="absolute bottom-0 left-0 right-0.75 bg-blue-500 rounded-t-full shadow-[0_-4px_12px_rgba(59,130,246,0.6)] z-20 animate-in fade-in zoom-in duration-300" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 콘텐츠 영역 */}
      <main className="max-w-5xl mx-auto px-6 py-8 lg:py-12 animate-in fade-in slide-in-from-bottom-3 duration-700">
        {children}
      </main>

      {/* 가로 스크롤바 제거 스타일 */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
}