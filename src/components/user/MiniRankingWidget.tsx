"use client";

import { useEffect, useState } from "react"; // ✨ 추가
import { useRanking } from "@/hooks/useRanking";
import { useRouter } from "next/navigation";
import { TrendingUp, ChevronRight, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MiniRankingWidget() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false); // ✨ 마운트 상태 추가
    // 랭킹 데이터 호출
    const { data: rankings, isLoading } = useRanking("user", "level", 0);
    const topThree = rankings?.slice(0, 3) ?? [];

    // 마운트 효과
    useEffect(() => {
        setMounted(true);
    }, []);

    /**
     * [핵심 수정] 서버 프리렌더링 시점에는 '아무것도' 렌더링하지 않습니다.
     * 이렇게 하면 서버와 클라이언트의 첫 HTML이 일치하게 되어 310 에러가 사라집니다.
     */
    if (!mounted) {
        return (
            <div className="flex flex-col h-full opacity-0">
                <div className="h-64 bg-slate-900/50 rounded-4xl animate-pulse" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full animate-in fade-in duration-500">
            <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-slate-500 uppercase tracking-widest">
                <TrendingUp size={16} /> Global Status
            </h3>
            
            <div className="flex-1 bg-linear-to-br from-slate-900 via-slate-900 to-emerald-900/20 border border-slate-800 rounded-4xl p-6 relative overflow-hidden group flex flex-col">
                <div className="relative z-10 flex-1">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-6 text-center">Top Rankers</p>
                    
                    <div className="space-y-3 mb-8">
                        {isLoading ? (
                            [1, 2, 3].map((i) => (
                                <div key={i} className="h-12 bg-slate-950/50 rounded-xl animate-pulse" />
                            ))
                        ) : topThree.length > 0 ? (
                            topThree.map((player, idx) => (
                                <div 
                                    key={player.nickname} 
                                    className="flex items-center justify-between bg-slate-950/40 p-3 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            "font-black italic text-sm w-4",
                                            idx === 0 ? "text-yellow-500" : "text-slate-500"
                                        )}>
                                            {idx + 1}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-slate-600 font-bold leading-none mb-1">{player.title}</span>
                                            <span className="text-xs font-bold text-slate-200">{player.nickname}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono font-black text-emerald-500">
                                        LV.{player.score}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-slate-600 text-xs">집계된 데이터 없음</div>
                        )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-800/50">
                        <div className="flex justify-between items-center px-2">
                            <span className="text-[10px] text-slate-500 font-bold uppercase">My Status</span>
                            <span className="text-xs font-black text-blue-400 italic">RANK #--</span>
                        </div>
                    </div>
                </div>
                <br/>
                <button 
                    onClick={() => router.push('/ranking/user/level')}
                    className="relative z-10 w-full py-4 bg-slate-800 hover:bg-emerald-600 text-white text-[10px] font-black rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest group/btn"
                >
                    View Leaderboard <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>

                <Crown size={120} className="absolute -bottom-4 -right-4 text-emerald-500/5 -rotate-12 group-hover:scale-110 transition-transform duration-700" />
            </div>
        </div>
    );
}