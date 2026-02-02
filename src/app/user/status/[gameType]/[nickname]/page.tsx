"use client";

import { useParams, useRouter } from 'next/navigation';
import { useHistories } from '@/hooks/useHistories';
import { GameTypeCode, GAME_TYPE_CONFIG } from '@/types/rooms';
import { ChevronLeft, Info, Trophy, Target, Hash } from 'lucide-react';
import { useMemo } from 'react';

export default function GameHistoryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { histories, isLoading } = useHistories();

    const gameType = (params.gameType as string).toUpperCase() as GameTypeCode;
    const nickname = decodeURIComponent(params.nickname as string);
    const gameInfo = GAME_TYPE_CONFIG[gameType];

    // 해당 게임 전적 필터링
    const filteredHistories = useMemo(() => {
        return histories.filter(h => h.gameType === gameType);
    }, [histories, gameType]);

    // 결과별 컬러 유틸리티
    const getStyle = (res: string) => {
        if (res === 'WIN') return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' };
        if (res === 'DRAW') return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' };
        return { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20' };
    };

    if (isLoading) return <div className="p-20 text-center text-slate-500 font-black animate-pulse">LOADING DATA...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 헤더 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-3 bg-slate-900 rounded-2xl text-slate-400 hover:text-white transition-colors border border-white/5">
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                            {gameInfo?.description || gameType} <span className="text-emerald-500">REPORT</span>
                        </h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{nickname}'s Career</p>
                    </div>
                </div>
            </div>

            {/* 상단 요약 배너 (광고 최적화 지점) */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Matches', value: filteredHistories.length, icon: <Hash size={14}/> },
                    { label: 'Recent Win', value: filteredHistories[0]?.result || '-', icon: <Trophy size={14}/> },
                    { label: 'Status', value: 'Active', icon: <Target size={14}/> }
                ].map((item, i) => (
                    <div key={i} className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl text-center">
                        <div className="flex justify-center text-slate-600 mb-1">{item.icon}</div>
                        <p className="text-[10px] text-slate-500 font-black uppercase mb-1">{item.label}</p>
                        <p className="text-sm font-black text-white uppercase">{item.value}</p>
                    </div>
                ))}
            </div>

            {/* 중간 광고 영역 */}
            <div className="w-full py-8 bg-slate-900/30 rounded-[2rem] border border-dashed border-slate-800 flex flex-col items-center justify-center">
                <span className="text-[10px] text-slate-700 font-black tracking-[0.3em] mb-2 uppercase text-center">Sponsored Content</span>
                <div className="w-[300px] h-[100px] bg-slate-950/50 rounded-lg flex items-center justify-center text-slate-800 text-xs font-bold">
                    AD_UNIT_PLACEHOLDER
                </div>
            </div>

            {/* 히스토리 리스트 */}
            <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">All Match Records</h4>
                {filteredHistories.length > 0 ? (
                    filteredHistories.map((h) => {
                        const style = getStyle(h.result);
                        return (
                            <div key={h.id} className={`group p-5 bg-slate-900/60 rounded-[2rem] border ${style.border} flex justify-between items-center hover:bg-slate-800/80 transition-all`}>
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-2xl ${style.bg} flex items-center justify-center font-black ${style.text} italic`}>
                                        {h.result[0]}
                                    </div>
                                    <div>
                                        <p className={`font-black tracking-tighter ${style.text}`}>{h.result}</p>
                                        <p className="text-[10px] text-slate-600 font-bold font-mono uppercase">{new Date(h.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="text-right font-mono">
                                    <p className="text-lg font-black text-white">{h.detail?.p1Score ?? 0} : {h.detail?.p2Score ?? 0}</p>
                                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-tighter italic">Score</p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="py-20 text-center bg-slate-900/30 rounded-[2.5rem] border border-dashed border-slate-800">
                        <Info className="mx-auto text-slate-700 mb-3" size={32} />
                        <p className="text-slate-500 text-sm font-bold uppercase italic">No history found for this game</p>
                    </div>
                )}
            </div>
        </div>
    );
}