"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/useUserStore';
import { useHistories } from '@/hooks/useHistories';
import { useUserStats } from '@/hooks/useUserStats'; // ✨ 새로 만든 훅 임포트
import { StatInfo } from '@/types/auth';
import { GameTypeCode, GAME_TYPE_CONFIG } from '@/types/rooms';
import { 
    Search, Trophy, Medal, Award, X, 
    ChevronRight, Loader2, LayoutGrid 
} from 'lucide-react';

export default function UserStatusPage() {
    const router = useRouter();
    const { user } = useUserStore(); // 닉네임 등 세션 정보
    
    // ✨ 서버에서 실시간 스탯(stats), 자산(asset) 정보를 가져옵니다.
    const { data: serverData, isLoading: isStatsLoading } = useUserStats();
    const { histories, isLoading: isHistoryLoading } = useHistories();
    
    const [search, setSearch] = useState("");
    const [selectedStat, setSelectedStat] = useState<StatInfo | null>(null);

    // 1. 세션이 없거나 데이터를 로딩 중일 때
    if (!user || isStatsLoading) return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-500">
            <Loader2 className="animate-spin mb-4" />
            <p>실시간 게임 데이터를 동기화 중입니다...</p>
        </div>
    );

    // 2. 승률 계산 함수 (무승부 0.5승 처리)
    const calculateWinRate = (stat: StatInfo) => {
        const total = stat.wins + stat.losses + (stat.draws || 0);
        if (total === 0) return "0.0";
        const effectiveWins = stat.wins + ((stat.draws || 0) * 0.5);
        return ((effectiveWins / total) * 100).toFixed(1);
    };

    const getTierInfo = (mmr: number) => {
        if (mmr >= 2000) return { icon: <Trophy size={18} className="text-yellow-400" />, label: "Diamond", color: "from-yellow-500/10", border: "border-yellow-500/20" };
        if (mmr >= 1500) return { icon: <Award size={18} className="text-blue-400" />, label: "Platinum", color: "from-blue-400/10", border: "border-blue-400/20" };
        if (mmr >= 1200) return { icon: <Medal size={18} className="text-slate-400" />, label: "Gold", color: "from-slate-400/10", border: "border-slate-400/20" };
        return { icon: <Medal size={18} className="text-orange-600" />, label: "Bronze", color: "from-orange-600/10", border: "border-orange-600/20" };
    };

    // 3. 필터링 로직 수정 (user.stats 대신 serverData.stats 사용)
    const filteredStats = useMemo(() => {
        if (!serverData?.stats) return [];
        return serverData.stats.filter(s => {
            const searchLower = search.toLowerCase();
            const gameNameKR = GAME_TYPE_CONFIG[s.gameType as GameTypeCode]?.description || "";
            return s.gameType.toLowerCase().includes(searchLower) || gameNameKR.includes(searchLower);
        });
    }, [serverData?.stats, search]);

    return (
        <div className="relative space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* 상단 컨트롤 바 */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center px-1">
                <div className="flex items-center gap-2 text-slate-500">
                    <LayoutGrid size={16} />
                    <span className="text-sm font-medium italic font-mono uppercase tracking-tighter">
                        Total {serverData?.stats?.length || 0} Game Stats
                    </span>
                </div>
                
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="게임 검색..."
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-emerald-500/50 transition-all text-sm text-slate-200"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* 카드 그리드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredStats.map((stat) => {
                    const tier = getTierInfo(stat.mmr);
                    const gameInfo = GAME_TYPE_CONFIG[stat.gameType as GameTypeCode];
                    const winRate = calculateWinRate(stat);

                    return (
                        <button 
                            key={stat.gameType}
                            onClick={() => setSelectedStat(stat)}
                            className={`relative group flex flex-col p-6 bg-slate-900/40 border ${tier.border} rounded-4xl hover:bg-slate-800/60 transition-all text-left overflow-hidden shadow-lg`}
                        >
                            <div className={`absolute inset-0 bg-linear-to-br ${tier.color} to-transparent opacity-40`} />
                            <div className="relative z-10 flex flex-col h-full w-full">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2.5 bg-slate-950/80 rounded-2xl shadow-inner">{tier.icon}</div>
                                    <div className="flex flex-col items-end font-mono">
                                        <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">Level</span>
                                        <span className="text-xl font-black text-white leading-none">{stat.level}</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                                    {gameInfo?.description || stat.gameType}
                                </h3>
                                <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mb-4">{tier.label} Division</p>
                                <div className="mt-auto pt-4 border-t border-slate-800/50 flex justify-between items-center font-mono">
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

            {/* 상세 정보 모달 */}
            {selectedStat && (
                <StatDetailModal 
                    stat={selectedStat} 
                    nickname={user.nickname}
                    histories={histories}
                    winRate={calculateWinRate(selectedStat)}
                    onClose={() => setSelectedStat(null)} 
                />
            )}
        </div>
    );
}

// --- 상세 모달 컴포넌트 (동일) ---
function StatDetailModal({ stat, nickname, histories, winRate, onClose }: { stat: StatInfo, nickname: string, histories: any[], winRate: string, onClose: () => void }) {
    const router = useRouter();
    const currentExp = stat.exp % 1000;
    const progressPercent = currentExp > 0 ? Math.max((currentExp / 10), 2) : 0;
    const gameName = GAME_TYPE_CONFIG[stat.gameType as GameTypeCode]?.description || stat.gameType;

    const recentMatches = useMemo(() => {
        return histories.filter(h => h.gameType === stat.gameType).slice(0, 3);
    }, [histories, stat.gameType]);

    const navigateToDetail = () => {
        onClose();
        router.push(`/user/status/${stat.gameType.toLowerCase()}/${nickname}`);
    };

    const getStyle = (res: string) => {
        if (res === 'WIN') return { dot: 'bg-emerald-500 shadow-[0_0_8px_#10b981]', text: 'text-emerald-400' };
        if (res === 'DRAW') return { dot: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]', text: 'text-amber-400' };
        return { dot: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]', text: 'text-rose-500' };
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-white/5 w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-8 flex justify-between items-center bg-white/5 border-b border-white/5">
                    <div>
                        <p className="text-emerald-500 text-[10px] font-black tracking-[0.3em] uppercase mb-1">Status Report</p>
                        <h2 className="text-3xl font-black text-white italic">{gameName}</h2>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-all"><X size={20} /></button>
                </div>
                
                <div className="p-8 space-y-8">
                    <div className="space-y-4 bg-slate-950/80 p-7 rounded-[2.5rem] border border-white/5">
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Current Level</p>
                                <p className="text-4xl font-black text-white italic font-mono">Lv.{stat.level}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black text-emerald-400 font-mono">
                                    {currentExp} <span className="text-xs text-slate-600 italic">/ 1000 EP</span>
                                </p>
                            </div>
                        </div>
                        <div className="h-4 w-full bg-black rounded-full border border-white/10 p-0.5 relative overflow-hidden">
                            <div 
                                className="h-full rounded-full bg-linear-to-r from-emerald-800 via-emerald-500 to-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-all duration-1000 ease-out"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-px bg-slate-800/50 rounded-3xl overflow-hidden border border-slate-800/50 text-center">
                        <div className="bg-slate-900 p-4">
                            <p className="text-[9px] text-slate-600 font-black uppercase mb-1">MMR</p>
                            <p className="text-lg font-black text-white font-mono">{stat.mmr}</p>
                        </div>
                        <div className="bg-slate-900 p-4 border-x border-slate-800/50">
                            <p className="text-[9px] text-slate-600 font-black uppercase mb-1">Win Rate</p>
                            <p className="text-lg font-black text-emerald-500 font-mono">{winRate}%</p>
                        </div>
                        <div className="bg-slate-900 p-4">
                            <p className="text-[9px] text-slate-600 font-black uppercase mb-1">W-D-L</p>
                            <p className="text-sm font-black text-slate-400 font-mono">{stat.wins}-{stat.draws || 0}-{stat.losses}</p>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Recent Match</h4>
                            <button onClick={navigateToDetail} className="text-[10px] text-emerald-500 font-black flex items-center gap-1 hover:underline underline-offset-4">
                                VIEW ALL <ChevronRight size={10} />
                            </button>
                        </div>
                        <div className="space-y-2">
                            {recentMatches.length > 0 ? recentMatches.map((m) => {
                                const style = getStyle(m.result);
                                const formatMatchDate = (dateStr: string) => {
                                    const date = new Date(dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`);
                                    return date.toLocaleString('ko-KR', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        hour12: false
                                    });
                                };
                                                        
                                return (
                                    <button 
                                        key={m.id}
                                        onClick={navigateToDetail}
                                        className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all group"
                                    >
                                        <div className="flex items-center gap-3 font-mono">
                                            <div className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                                            <span className={`text-xs font-black ${style.text}`}>{m.result}</span>
                                        </div>
                                        <div className="flex items-center gap-2 font-mono">
                                            <span className="text-[10px] text-slate-600 font-bold italic">{formatMatchDate(m.createdAt)}</span>
                                            <ChevronRight size={12} className="text-slate-800 group-hover:text-emerald-500" />
                                        </div>
                                    </button>
                                );
                            }) : <p className="text-center py-4 text-slate-600 text-xs italic font-mono">No history found.</p>}
                        </div>
                    </div>

                    <button 
                        onClick={navigateToDetail}
                        className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-3xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                    >
                        전체 매치 리포트 분석
                        <ChevronRight size={18} strokeWidth={3} />
                    </button>
                </div>
            </div>
        </div>
    );
}