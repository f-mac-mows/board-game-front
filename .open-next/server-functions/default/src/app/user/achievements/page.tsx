"use client";

import { useMemo } from "react";
import { AchievementCategory } from "@/types/achievement";
import { useAchievements } from "@/hooks/useAchievements";

// 카테고리 스타일 매핑
const categoryStyles: Record<AchievementCategory, { color: string; bgColor: string; borderColor: string; icon: string }> = {
    COMBAT: { color: 'text-red-400', bgColor: 'bg-red-900/50', borderColor: 'border-red-600', icon: '⚔️' },
    COLLECTION: { color: 'text-yellow-400', bgColor: 'bg-yellow-900/50', borderColor: 'border-yellow-600', icon: '💎' },
    SOCIAL: { color: 'text-blue-400', bgColor: 'bg-blue-900/50', borderColor: 'border-blue-600', icon: '🤝' },
    SPECIAL: { color: 'text-purple-400', bgColor: 'bg-purple-900/50', borderColor: 'border-purple-600', icon: '✨' },
};

export default function AchievementPage() {
    // 훅에서 필요한 모든 상태와 액션을 가져옵니다.
    const { achievements, isLoading, error, claimReward, isClaiming } = useAchievements();

    // 화면에 표시할 최종 데이터 가공 (isHidden 처리)
    const displayAchievements = useMemo(() => {
        if (!achievements) return [];
        
        return achievements.map(ach => {
            // 숨김 업적 처리: 미완료 & 숨김 처리된 업적은 내용 가림
            if (ach.hidden && !ach.completed) {
                return {
                    ...ach,
                    title: '???',
                    description: '달성 시 공개되는 비밀 업적입니다.',
                    icon: '❓',
                    progressPercent: 0,
                };
            }

            return {
                ...ach,
                progressPercent: Math.min((ach.currentProgress / ach.maxProgress) * 100, 100),
            };
        });
    }, [achievements]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-900 text-white">
                <p className="text-xl animate-pulse">업적 데이터를 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-900 text-red-400">
                <p className="text-xl">데이터 로드 실패: {(error as any).message}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br rounded-xl from-slate-950 to-slate-800 text-white p-6 md:p-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-lg">
                🏆 나의 업적
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {displayAchievements.map((ach) => {
                    const styles = categoryStyles[ach.category] || categoryStyles.SPECIAL;
                    const canClaim = ach.completed && !ach.rewarded;

                    return (
                        <div
                            key={ach.id}
                            className={`relative bg-slate-900 rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col ${
                                ach.completed ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-slate-800'
                            }`}
                        >
                            {/* 카테고리 뱃지 */}
                            <div className={`absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${styles.bgColor} ${styles.color} border ${styles.borderColor}/30`}>
                                {ach.category}
                            </div>
                            
                            <br/>
                            
                            {/* 헤더 부분 */}
                            <div className="flex items-start gap-3 mb-3 mt-2">
                                <span className="text-2xl shrink-0">{ach.icon}</span>
                                <h2 className="text-lg font-bold leading-tight break-keep pt-1">
                                    {ach.title}
                                </h2>
                            </div>

                            {/* 설명 */}
                            <p className="text-slate-400 text-xs leading-relaxed mb-4 min-h-[32px]">
                                {ach.description}
                            </p>

                            {/* 보상 및 프로그레스 영역 */}
                            <div className="mt-auto">
                                <div className="flex justify-between items-center mb-2 bg-slate-950/50 p-2 rounded-lg border border-white/5">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reward</span>
                                    <span className={`text-xs font-bold ${ach.completed ? 'text-yellow-400' : 'text-emerald-400'}`}>
                                        {ach.reward.label}
                                    </span>
                                </div>

                                {/* 경험치/진행 바 */}
                                <div className="w-full bg-slate-950 rounded-full h-1.5 border border-white/5 overflow-hidden">
                                    <div 
                                        className="h-full transition-all duration-1000"
                                        style={{ 
                                            width: `${ach.progressPercent}%`,
                                            background: ach.completed ? '#f59e0b' : '#10b981',
                                            boxShadow: ach.completed ? '0 0 8px #f59e0b' : '0 0 8px #10b981'
                                        }}
                                    />
                                </div>
                                
                                <div className="flex justify-between mt-1.5">
                                    <span className="text-[9px] text-slate-500 font-medium">
                                        {ach.completed && ach.completedAt && new Date(ach.completedAt).toLocaleDateString()}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">
                                        {ach.completed ? 'COMPLETED' : `${ach.currentProgress} / ${ach.maxProgress}`}
                                    </span>
                                </div>

                                {/* 버튼 영역 */}
                                <div className="mt-4">
                                    {ach.completed && ach.rewarded ? (
                                        <button 
                                            disabled 
                                            className="w-full py-2 bg-slate-800 text-slate-500 text-xs font-black rounded-xl border border-slate-700 cursor-not-allowed"
                                        >
                                            수령 완료
                                        </button>
                                    ) : canClaim ? (
                                        <button 
                                            className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition-all active:translate-y-1 active:shadow-none shadow-[0_4px_0_rgb(5,150,105)] disabled:opacity-50"
                                            onClick={() => claimReward(ach.id)}
                                            disabled={isClaiming}
                                        >
                                            {isClaiming ? '수령 중...' : '보상 받기'}
                                        </button>
                                    ) : (
                                        <button 
                                            disabled 
                                            className="w-full py-2 bg-slate-800/50 text-slate-600 text-xs font-black rounded-xl border border-white/5 cursor-not-allowed"
                                        >
                                            진행 중...
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}