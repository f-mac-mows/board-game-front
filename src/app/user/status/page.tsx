"use client";

import { useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { StatInfo } from '@/types/auth';
import { GameTypeCode, GAME_TYPE_CONFIG } from '@/types/rooms';
import { Search, Trophy, Medal, Award, Filter, Info, X } from 'lucide-react';

export default function UserStatusPage() {
    const { user } = useUserStore();
    const [search, setSearch] = useState("");
    const [selectedStat, setSelectedStat] = useState<StatInfo | null>(null);

    if (!user) return <div className="p-10 text-slate-500">로그인이 필요합니다.</div>;

    // 1. 티어 결정 로직
    const getTierInfo = (mmr: number) => {
        if (mmr >= 2000) return { icon: <Trophy size={18} className="text-yellow-400" />, label: "Diamond", color: "from-yellow-500/10", border: "border-yellow-500/20" };
        if (mmr >= 1500) return { icon: <Award size={18} className="text-blue-400" />, label: "Platinum", color: "from-blue-400/10", border: "border-blue-400/20" };
        if (mmr >= 1200) return { icon: <Medal size={18} className="text-slate-400" />, label: "Gold", color: "from-slate-400/10", border: "border-slate-400/20" };
        return { icon: <Medal size={18} className="text-orange-600" />, label: "Bronze", color: "from-orange-600/10", border: "border-orange-600/20" };
    };

    // 2. 한글/영문 통합 필터링 로직
    const filteredStats = user.stats.filter(s => {
        const searchLower = search.toLowerCase();
        const gameNameKR = GAME_TYPE_CONFIG[s.gameType as GameTypeCode]?.description || "";
        return s.gameType.toLowerCase().includes(searchLower) || gameNameKR.includes(searchLower);
    });

    return (
        <div className="relative space-y-6 animate-in fade-in duration-700">
            {/* 상단 컨트롤 바 */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-2 text-slate-500">
                    <Filter size={16} />
                    <span className="text-sm font-medium italic font-mono uppercase tracking-tighter">
                        Total {user.stats.length} Game Stats
                    </span>
                </div>
                
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="게임 이름 또는 한글 검색..."
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-emerald-500/50 transition-all text-sm text-slate-200"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* 카드 그리드 */}
            {filteredStats.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredStats.map((stat) => {
                        const tier = getTierInfo(stat.mmr);
                        const gameInfo = GAME_TYPE_CONFIG[stat.gameType as GameTypeCode];
                        
                        const winRate = (stat.wins + stat.losses > 0) 
                            ? ((stat.wins / (stat.wins + stat.losses)) * 100).toFixed(1) 
                            : "0.0";

                        return (
                            <button 
                                key={stat.gameType}
                                onClick={() => setSelectedStat(stat)}
                                className={`relative z-0 group flex flex-col p-6 bg-slate-900/40 border ${tier.border} rounded-[2rem] hover:bg-slate-800/60 transition-all text-left overflow-hidden shadow-lg`}
                            >
                                {/* 배경 그라데이션 */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} to-transparent opacity-40`} />
                                
                                <div className="relative z-10 flex flex-col h-full w-full">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2.5 bg-slate-950/80 rounded-2xl shadow-inner">
                                            {tier.icon}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">Level</span>
                                            <span className="text-xl font-black text-white leading-none">{stat.level}</span>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                                        {gameInfo?.description || stat.gameType}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mb-4">{tier.label} Division</p>
                                    
                                    <div className="mt-auto pt-4 border-t border-slate-800/50 flex justify-between items-center">
                                        <div>
                                            <p className="text-[9px] text-slate-600 font-black uppercase">Rating</p>
                                            <p className="text-md font-bold text-slate-300">{stat.mmr} RP</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] text-slate-600 font-black uppercase">Win Rate</p>
                                            <p className="text-md font-bold text-emerald-500">{winRate}%</p>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="py-20 text-center bg-slate-900/30 rounded-[2rem] border border-dashed border-slate-800">
                    <Info className="mx-auto text-slate-700 mb-3" size={32} />
                    <p className="text-slate-500 text-sm">해당하는 게임 전적을 찾을 수 없습니다.</p>
                </div>
            )}

            {/* 상세 정보 모달 */}
            {selectedStat && (
                <StatDetailModal 
                    stat={selectedStat} 
                    onClose={() => setSelectedStat(null)} 
                />
            )}
        </div>
    );
}

// ---------------------------------------------------------
// 상세 모달 컴포넌트
// ---------------------------------------------------------
function StatDetailModal({ stat, onClose }: { stat: StatInfo, onClose: () => void }) {
    const currentExp = stat.exp % 1000;
    const progressPercent = currentExp > 0 ? Math.max((currentExp / 10), 2) : 0;
    const gameName = GAME_TYPE_CONFIG[stat.gameType as GameTypeCode]?.description || stat.gameType;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-white/5 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                {/* 모달 헤더 */}
                <div className="p-8 flex justify-between items-center bg-white/5">
                    <div>
                        <p className="text-emerald-500 text-[10px] font-black tracking-[0.3em] uppercase mb-1">Status Report</p>
                        <h2 className="text-3xl font-black text-white">{gameName}</h2>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-all">
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>
                
                <div className="p-8 space-y-8">
                    {/* 경험치 바 상세 (Modal View) */}
                    <div className="space-y-4 bg-slate-950/80 p-7 rounded-[2.5rem] border border-white/5 shadow-inner">
                        {/* 상단 텍스트 정보 */}
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Current Level</p>
                                <p className="text-4xl font-black text-white italic">Lv.{stat.level}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black text-emerald-400" style={{ color: '#34d399' }}>
                                    {stat.exp % 1000} <span className="text-xs text-slate-600 italic">/ 1000 EP</span>
                                </p>
                            </div>
                        </div>

                        {/* 게이지 컨테이너 */}
                        <div style={{
                            height: '16px',          // 높이 고정
                            width: '100%',           // 너비 전체
                            backgroundColor: '#000', // 배경 검정
                            borderRadius: '999px',   // 둥글게
                            border: '1px solid rgba(255,255,255,0.1)',
                            overflow: 'hidden',
                            padding: '2px',
                            position: 'relative'     // 위치 기준점
                        }}>
                            {/* 실제 채워지는 게이지 */}
                            <div style={{
                                height: '100%',      // 부모 높이 100% 채움
                                width: `${progressPercent}%`,
                                background: 'linear-gradient(90deg, #065f46, #10b981, #6ee7b7)', // 강제 그라데이션
                                borderRadius: '999px',
                                boxShadow: '0 0 10px rgba(16,185,129,0.8)',
                                transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                display: 'block'     // 렌더링 강제
                            }}>
                                {/* 내부 광원 효과 */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                                }} />
                            </div>
                        </div>
                    </div>                
                    {/* 기록 요약 */}
                    <div className="grid grid-cols-2 gap-px bg-slate-800/50 rounded-3xl overflow-hidden border border-slate-800/50 text-center">
                        <div className="bg-slate-900 p-6">
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-widest">MMR Rating</p>
                            <p className="text-2xl font-black text-white italic">{stat.mmr}</p>
                        </div>
                        <div className="bg-slate-900 p-6">
                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-widest">Total Wins</p>
                            <p className="text-2xl font-black text-emerald-500 italic">{stat.wins}</p>
                        </div>
                    </div>

                    {/* 최근 전적 (플레이스홀더) */}
                    <div>
                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ml-1">Recent Match History</h4>
                        <div className="space-y-3">
                            {[1, 0, 1].map((win, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1.5 h-1.5 rounded-full ${win ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]' : 'bg-red-500'}`} />
                                        <span className={`text-xs font-black tracking-tighter ${win ? 'text-emerald-400' : 'text-red-500'}`}>
                                            {win ? 'VICTORY' : 'DEFEAT'}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-600 font-bold tracking-tighter italic">2026.02.01</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}