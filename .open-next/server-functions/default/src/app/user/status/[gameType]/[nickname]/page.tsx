"use client";

import { useParams, useRouter } from 'next/navigation';
import { useHistories } from '@/hooks/useHistories';
import { GameTypeCode, GAME_TYPE_CONFIG } from '@/types/rooms';
import { 
    ChevronLeft, Info, Trophy, Target, Hash, 
    Gift, CheckCircle2, PlayCircle, Sparkles,
    ChevronDown, ChevronUp, History, Activity
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { LogSection } from '@/components/log/LogSection';

export default function GameHistoryDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { histories, isLoading } = useHistories();
    
    // 1. 확장된 로그 ID 관리를 위한 상태 추가
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const gameType = (params.gameType as string).toUpperCase() as GameTypeCode;
    const nickname = decodeURIComponent(params.nickname as string);
    const gameInfo = GAME_TYPE_CONFIG[gameType];

    const filteredHistories = useMemo(() => {
        return histories.filter(h => h.gameType === gameType);
    }, [histories, gameType]);

    const getStyle = (res: string) => {
        if (res === 'WIN') return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-500' };
        if (res === 'DRAW') return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', dot: 'bg-amber-400' };
        return { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/20', dot: 'bg-rose-500' };
    };

    const handleRewardAd = async (historyId: number) => {
        console.log(`${historyId}번 보상 광고 실행`);
        const success = confirm("광고를 시청하고 보상을 2배로 받으시겠습니까?");
        if (success) alert("보상이 지급되었습니다!");
    };

    if (isLoading) return <div className="p-20 text-center text-slate-500 font-black animate-pulse uppercase tracking-widest">Loading History...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 헤더 섹션 (기존과 동일) */}
            <div className="flex items-center gap-4">
                <button onClick={() => router.back()} className="p-3 bg-slate-900 rounded-2xl text-slate-400 hover:text-white transition-colors border border-white/5">
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                        {gameInfo?.description || gameType} <span className="text-emerald-500 text-sm not-italic ml-1 font-sans">REPORT</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{nickname}'s archives</p>
                </div>
            </div>

            {/* 상단 BM 위젯 (기존과 동일) */}
            <div className="p-6 bg-linear-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-[2.5rem] flex justify-between items-center">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-emerald-400" />
                        <span className="text-xs font-black text-white uppercase italic">Level Up Faster</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">전적 리스트의 'Get 2X' 버튼으로 보상을 극대화하세요.</p>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400"><Gift size={24} className="animate-bounce" /></div>
            </div>

            {/* 히스토리 리스트 (확장형 수정본) */}
            <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-2">Match History</h4>
                {filteredHistories.length > 0 ? (
                    filteredHistories.map((h) => {
                        console.log("히스토리 샘플:", filteredHistories[0]);
                        const style = getStyle(h.result);
                        const uniqueKey = h.id || `history-${h.gameId}`
                        const isExpanded = expandedId === h.gameId;

                        return (
                            <div key={uniqueKey} className={`group flex flex-col bg-slate-900/40 rounded-4xl border ${isExpanded ? 'border-emerald-500/30 bg-slate-800/40' : 'border-white/5'} transition-all overflow-hidden`}>
                                {/* 카드 헤더 (클릭 시 확장) */}
                                <div 
                                    onClick={() => setExpandedId(isExpanded ? null : h.gameId)}
                                    className="p-5 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-1 h-8 rounded-full ${style.dot} opacity-50`} />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className={`font-black tracking-tighter ${style.text} text-lg`}>{h.result}</p>
                                                
                                                {/* 보상 버튼: 가로 배치, 이벤트 전파 차단 */}
                                                {h.rewarded ? (
                                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-800 rounded-full border border-white/5">
                                                        <CheckCircle2 size={10} className="text-slate-500" />
                                                        <span className="text-[9px] text-slate-500 font-black uppercase italic">Boosted</span>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // 카드 확장 방지
                                                            handleRewardAd(h.gameId);
                                                        }}
                                                        className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-full transition-all group/btn"
                                                    >
                                                        <PlayCircle size={10} className="text-emerald-500" />
                                                        <span className="text-[9px] text-emerald-400 font-black uppercase italic group-hover/btn:text-emerald-300">Get 2X</span>
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-[9px] text-slate-600 font-bold font-mono uppercase tracking-tight">
                                                {new Date(h.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-xl font-black text-white font-mono tracking-tighter">
                                                {h.detail?.p1Score ?? 0}<span className="text-slate-700 mx-1">:</span>{h.detail?.p2Score ?? 0}
                                            </p>
                                            <p className="text-[9px] text-slate-700 font-black uppercase italic">Final Score</p>
                                        </div>
                                        {isExpanded ? <ChevronUp size={16} className="text-emerald-500" /> : <ChevronDown size={16} className="text-slate-700" />}
                                    </div>
                                </div>

                                {/* 확장 로그 영역 (YachtGameLog 구조 반영) */}
                                {isExpanded && (
                                    <div className="px-6 pb-6 pt-2 bg-black/20 animate-in slide-in-from-top-2 duration-300">
                                        <div className="h-px bg-white/5 mb-4" />
                                        <div className="flex items-center gap-2 mb-4">
                                            <History size={12} className="text-emerald-500" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Real-time Match Logs</span>
                                        </div>

                                        <LogSection 
                                            gameId={Number(h.gameId)} 
                                            gameType={h.gameType} 
                                            nickname={nickname} 
                                        />
                                        
                                        {/* 보상 유도 섹션은 로그 아래에 그대로 유지 */}
                                        {!h.rewarded && (
                                            <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl flex items-center justify-between group">
                                                <p className="text-[10px] text-emerald-500/80 font-bold italic">
                                                    복기를 완료하셨나요? 보상을 2배로 챙기세요!
                                                </p>
                                                <button 
                                                    onClick={() => handleRewardAd(h.gameId)}
                                                    className="px-4 py-2 bg-emerald-500 text-slate-950 text-[11px] font-black rounded-xl hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
                                                >
                                                    GET 2X BOOST
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="py-20 text-center bg-slate-900/30 rounded-[2.5rem] border border-dashed border-slate-800 text-slate-500 text-sm font-bold uppercase italic tracking-widest">
                        Empty Archives
                    </div>
                )}
            </div>
            <div className="h-20" />
        </div>
    );
}