"use client";

import { useEffect, useMemo, useState } from 'react';
import { useAchievements } from '@/hooks/useAchievements';
import { useUserStats } from '@/hooks/useUserStats'; 
import { useUserStore } from '@/store/useUserStore'; 
import MiniRankingWidget from '@/components/user/MiniRankingWidget';
import { Wallet, Sparkles, Award, Zap, Trophy } from 'lucide-react';

export default function UserProfilePage() {
    const [mounted, setMounted] = useState(false);
    
    // 1. Zustand에서 세션 정보 및 통합 레벨(astat) 추출
    const { user: session } = useUserStore();
    
    // 2. React Query에서 실시간 데이터(asset, stats) 추출
    const { data: serverData, isLoading: isStatsLoading } = useUserStats();
    const { achievements, isLoading: isAchLoading } = useAchievements();

    useEffect(() => {
        setMounted(true);
    }, []);

    // SSR 및 초기 로딩 가드
    if (!mounted) return <div className="min-h-screen bg-slate-950" />;

    // 로딩 처리: 세션 데이터가 확인될 때까지
    if (!session || isStatsLoading) {
        return (
            <div className="flex justify-center items-center h-64 text-slate-500 animate-pulse font-bold">
                데이터를 동기화 중입니다...
            </div>
        );
    }

    // 3. 통합 레벨 연산 (Zustand의 session.astat 사용)
    const accountLevelInfo = useMemo(() => {
        const a = session.astat;
        const current = a?.currentExp ?? 0;
        const required = a?.requiredExp ?? 1000;
        const level = a?.level ?? 1;
        const percent = Math.min((current / required) * 100, 100);
        
        return { current, required, level, percent };
    }, [session.astat]);

    const recentAchievements = useMemo(() => {
        if (!achievements) return [];
        return achievements
            .filter(a => a.completed)
            .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
            .slice(0, 3);
    }, [achievements]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* [Section 0] 통합 레벨 섹션 (Zustand 기반) */}
            <section className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-4xl p-8 shadow-2xl">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
                
                <div className="relative z-10">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                                <Zap size={14} className="fill-emerald-500" /> Account Progression
                            </p>
                            <h2 className="text-5xl font-black text-white tracking-tighter">
                                LV. <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400">
                                    {accountLevelInfo.level}
                                </span>
                            </h2>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black text-white">{accountLevelInfo.current.toLocaleString()}</span>
                                <span className="text-xs text-slate-500 font-bold">/ {accountLevelInfo.required.toLocaleString()} EXP</span>
                            </div>
                            <p className="text-[10px] text-slate-600 font-medium mt-1">
                                다음 레벨까지 {(accountLevelInfo.required - accountLevelInfo.current).toLocaleString()} 남음
                            </p>
                        </div>
                    </div>

                    <div className="w-full bg-slate-950 h-5 rounded-2xl border border-white/5 p-1 shadow-inner">
                        <div 
                            className="h-full bg-linear-to-r from-emerald-500 via-teal-400 to-cyan-500 rounded-xl transition-all duration-1000 ease-out relative group"
                            style={{ width: `${accountLevelInfo.percent}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                            <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full blur-md animate-pulse" />
                        </div>
                    </div>
                </div>
            </section>

            {/* [Section 1] 자산 섹션 (React Query 기반) */}
            <section>
                <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-slate-500 uppercase tracking-widest">
                    <Wallet size={16} /> Asset Overview
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-4xl relative overflow-hidden group hover:border-yellow-500/50 transition-all">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 group-hover:scale-125 transition-all duration-500">
                            <CoinsIcon size={100} className="text-yellow-500" />
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Available Balance</p>
                        <div className="flex items-baseline gap-2 mt-3">
                            <h4 className="text-4xl font-black text-yellow-500 tracking-tight">
                                {serverData?.asset?.gold?.toLocaleString() ?? 0}
                            </h4>
                            <span className="text-slate-500 font-black text-sm">GOLD</span>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-8 rounded-4xl relative overflow-hidden group hover:border-blue-500/50 transition-all">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 group-hover:scale-125 transition-all duration-500">
                            <Sparkles size={100} className="text-blue-500" />
                        </div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Accumulated Points</p>
                        <div className="flex items-baseline gap-2 mt-3">
                            <h4 className="text-4xl font-black text-blue-500 tracking-tight">
                                {serverData?.asset?.point?.toLocaleString() ?? 0}
                            </h4>
                            <span className="text-slate-500 font-black text-sm">PT</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* [Section 2] 업적 & 랭킹 섹션 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-slate-500 uppercase tracking-widest">
                        <Award size={16} /> Recent Milestones
                    </h3>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-4xl p-3 backdrop-blur-sm">
                        <div className="space-y-2">
                            {isAchLoading ? (
                                <div className="p-10 text-center text-slate-600 animate-pulse text-sm">업적 로드 중...</div>
                            ) : recentAchievements.length > 0 ? (
                                recentAchievements.map((ach) => (
                                    <div key={ach.id} className="flex items-center gap-4 p-5 hover:bg-slate-800/80 rounded-2xl transition-all border border-transparent hover:border-white/5 group">
                                        <div className="p-4 bg-slate-950 rounded-2xl text-2xl group-hover:scale-110 transition-transform">
                                            {ach.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h5 className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{ach.title}</h5>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-1">{ach.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-[10px] text-slate-600 font-mono">
                                                {ach.completedAt ? new Date(ach.completedAt).toLocaleDateString() : '-'}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center p-12 text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl">
                                    <Trophy size={40} className="mb-3 opacity-20" />
                                    <p className="text-sm">달성한 업적이 없습니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <MiniRankingWidget />
            </div>
        </div>
    );
}

function CoinsIcon({ size, className }: { size: number, className: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="8" cy="8" r="6"/><path d="M18 8c0 4.42-3.58 8-8 8a8.003 8.003 0 0 1-7.11-4.39"/><path d="M23 12a9 9 0 0 1-15.56 6.11"/>
        </svg>
    );
}