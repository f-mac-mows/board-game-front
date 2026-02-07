"use client";

import { useState, useMemo, useEffect } from 'react';
import { useUserStore } from '@/store/useUserStore';
import { useHistories } from '@/hooks/useHistories';
import { useUserStats } from '@/hooks/useUserStats'; 
import { StatInfo } from '@/types/auth';
import { GameTypeCode, GAME_TYPE_CONFIG } from '@/types/rooms';
import { Search, Loader2, LayoutGrid } from 'lucide-react';
import StatDetailModal from '@/components/status/StatDetailModal';
import StatCard from '@/components/status/StatCard';

export default function UserStatusPage() {
    const [mounted, setMounted] = useState(false);
    const { user: session } = useUserStore(); // Zustand: 프로필 전용
    const { data: gameData, isLoading: isStatsLoading } = useUserStats(); // React Query: 게임 데이터 전용
    const { histories } = useHistories();
    
    const [search, setSearch] = useState("");
    const [selectedStat, setSelectedStat] = useState<StatInfo | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 승률 계산 (비즈니스 로직은 상위에서 관리하여 컴포넌트에 주입)
    const calculateWinRate = (stat: StatInfo) => {
        const total = stat.wins + stat.losses + (stat.draws || 0);
        if (total === 0) return "0.0";
        const effectiveWins = stat.wins + ((stat.draws || 0) * 0.5);
        return ((effectiveWins / total) * 100).toFixed(1);
    };

    const filteredStats = useMemo(() => {
        const stats = gameData?.stats || [];
        if (stats.length === 0) return [];
        
        return stats.filter(s => {
            const searchLower = search.toLowerCase();
            const gameInfo = GAME_TYPE_CONFIG[s.gameType as GameTypeCode];
            const gameNameKR = gameInfo?.description || "";
            return s.gameType.toLowerCase().includes(searchLower) || gameNameKR.toLowerCase().includes(searchLower);
        });
    }, [gameData, search]);

    if (!mounted) return <div className="min-h-screen bg-slate-950" />;

    // 로딩 처리: gameData가 없을 때만 표시
    if (isStatsLoading && !gameData) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-slate-500">
                <Loader2 className="animate-spin mb-4 text-emerald-500" />
                <p className="font-bold">실시간 전적 데이터를 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="relative space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* 상단 컨트롤 바 */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center px-1">
                <div className="flex items-center gap-2 text-slate-500">
                    <LayoutGrid size={16} />
                    <span className="text-sm font-medium italic font-mono uppercase tracking-tighter">
                        Total {gameData?.stats?.length || 0} Game Stats
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
            {filteredStats.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredStats.map((stat) => (
                        <StatCard 
                            key={stat.gameType}
                            stat={stat}
                            onClick={() => setSelectedStat(stat)}
                            calculateWinRate={calculateWinRate}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-4xl">
                    <LayoutGrid size={48} className="mb-4 opacity-20" />
                    <p>표시할 전적 데이터가 없습니다.</p>
                </div>
            )}

            {/* 상세 정보 모달 */}
            {selectedStat && (
                <StatDetailModal 
                    stat={selectedStat} 
                    nickname={session?.nickname || ""}
                    histories={histories}
                    winRate={calculateWinRate(selectedStat)}
                    onClose={() => setSelectedStat(null)} 
                />
            )}
        </div>
    );
}