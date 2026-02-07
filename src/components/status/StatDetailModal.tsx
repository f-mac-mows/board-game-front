import { StatInfo } from "@/types/auth";
import { GAME_TYPE_CONFIG, GameTypeCode } from "@/types/rooms";
import { ChevronRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export default function StatDetailModal({ stat, nickname, histories, winRate, onClose }: { stat: StatInfo, nickname: string, histories: any[], winRate: string, onClose: () => void }) {
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