"use client";

import { useEffect, useMemo, useState } from "react";
import { useAchievementStore } from "@/store/useAchievementStore";
import { Achievement, UserAchievement, AchievementCategory } from "@/types/achievement"; // 정의하신 타입 임포트
import { userApi } from "@/api/user"; // API 연동 예시
import { useQuery } from '@tanstack/react-query'; // TanStack Query 임포트

// --- Mock Data (나중에 API 호출로 대체될 부분) ---
const MOCK_ALL_ACHIEVEMENTS: Achievement[] = [
    { id: 'first_win', category: 'COMBAT', title: '첫 승리의 기쁨', description: '첫 번째 게임에서 승리하세요.', icon: '🏆', maxProgress: 1, reward: { type: 'EXP', value: 100, label: '100 EXP' }, isHidden: false },
    { id: 'play_10_games', category: 'SOCIAL', title: '참가에 의의를', description: '게임에 10회 참여하세요.', icon: '🤝', maxProgress: 10, reward: { type: 'GOLD', value: 50, label: '50 Gold' }, isHidden: false },
    { id: 'yacht_master', category: 'COLLECTION', title: '야추 마스터', description: '야추 스킬을 5회 사용하세요.', icon: '🎲', maxProgress: 5, reward: { type: 'TITLE', value: '야추광인', label: '칭호: 야추광인' }, isHidden: false },
    { id: 'level_5', category: 'SPECIAL', title: '성장의 시작', description: '캐릭터 레벨 5를 달성하세요.', icon: '✨', maxProgress: 5, reward: { type: 'EXP', value: 300, label: '300 EXP' }, isHidden: true },
    { id: 'win_streak_3', category: 'COMBAT', title: '연승 가도', description: '게임에서 3연승을 달성하세요.', icon: '🔥', maxProgress: 3, reward: { type: 'EXP', value: 200, label: '200 EXP' }, isHidden: false },
    { id: 'collect_100_gold', category: 'COLLECTION', title: '황금 수집가', description: '총 100 Gold를 모으세요.', icon: '💰', maxProgress: 100, reward: { type: 'TITLE', value: '부자', label: '칭호: 부자' }, isHidden: false },
];

const MOCK_USER_ACHIEVEMENTS: UserAchievement[] = [
    { achievementId: 'first_win', currentProgress: 1, isCompleted: true, completedAt: '2023-01-15', isRewarded: false },
    { achievementId: 'play_10_games', currentProgress: 7, isCompleted: false, completedAt: undefined, isRewarded: false },
    { achievementId: 'yacht_master', currentProgress: 3, isCompleted: false, completedAt: undefined, isRewarded: false },
    { achievementId: 'level_5', currentProgress: 2, isCompleted: false, completedAt: undefined, isRewarded: false },
    { achievementId: 'win_streak_3', currentProgress: 0, isCompleted: false, completedAt: undefined, isRewarded: false },
];
// --- Mock Data 끝 ---

// 카테고리별 색상 및 아이콘 매핑 (Tailwind 색상으로 변경)
const categoryStyles: Record<AchievementCategory, { color: string; bgColor: string; borderColor: string; icon: string }> = {
    COMBAT: { color: 'text-red-400', bgColor: 'bg-red-900/50', borderColor: 'border-red-600', icon: '⚔️' },
    COLLECTION: { color: 'text-yellow-400', bgColor: 'bg-yellow-900/50', borderColor: 'border-yellow-600', icon: '💎' },
    SOCIAL: { color: 'text-blue-400', bgColor: 'bg-blue-900/50', borderColor: 'border-blue-600', icon: '🤝' },
    SPECIAL: { color: 'text-purple-400', bgColor: 'bg-purple-900/50', borderColor: 'border-purple-600', icon: '✨' },
};

export default function AchievementPage() {
    const { allAchievements, userAchievements, setInitialData } = useAchievementStore();

    // TanStack Query를 이용해 서버에서 업적 데이터 불러오기
    // 실제 API 연동 시에는 userApi.getAchievements() 등을 사용합니다.
    const { data, isLoading, isError } = useQuery({
        queryKey: ['achievements'],
        queryFn: async () => {
            // 실제 API 호출 (예: const res = await userApi.getAchievements(); return res.data;)
            // 지금은 Mock Data 사용
            return {
                all: MOCK_ALL_ACHIEVEMENTS,
                user: MOCK_USER_ACHIEVEMENTS,
            };
        },
        // 캐시 및 데이터 stale 설정
        staleTime: 5 * 60 * 1000, // 5분 동안은 데이터를 '신선한' 상태로 간주
        refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 리페치 방지 (필요에 따라 설정)
    });

    // Query로 데이터가 로드되면 Zustand 스토어에 세팅
    useEffect(() => {
        if (data) {
            setInitialData(data.all, data.user);
        }
    }, [data, setInitialData]);


    // 화면에 표시할 최종 업적 목록 (정적 데이터 + 유저 상태 병합)
    const displayAchievements = useMemo(() => {
        return allAchievements.map(ach => {
            const status = userAchievements.find(s => s.achievementId === ach.id);
            const mergedAch = {
                ...ach,
                currentProgress: status?.currentProgress || 0,
                isCompleted: status?.isCompleted || false,
                isRewarded: status?.isRewarded || false,
                completedAt: status?.completedAt || undefined,
            };
            
            // 숨김 업적 처리: 미완료 & 숨김 처리된 업적은 내용 가림
            if (mergedAch.isHidden && !mergedAch.isCompleted) {
                return {
                    ...mergedAch,
                    title: '???',
                    description: '숨겨진 업적',
                    icon: '❓',
                    progressPercent: 0,
                    reward: { type: 'EXP', value: '?', label: '???' }
                };
            }

            return {
                ...mergedAch,
                progressPercent: Math.min((mergedAch.currentProgress / mergedAch.maxProgress) * 100, 100),
            };
        });
    }, [allAchievements, userAchievements]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-900 text-white">
                <p className="text-xl animate-pulse">업적 데이터를 불러오는 중...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-900 text-red-400">
                <p className="text-xl">업적 데이터를 불러오는데 실패했습니다.</p>
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
                    const isCompletedClass = ach.isCompleted ? 'border-emerald-500 shadow-emerald-500/30' : 'border-slate-700';
                    const hoverEffect = ach.isCompleted ? 'hover:scale-105 transition-transform duration-300' : '';

                    return (
                        <div
                            key={ach.id}
                            className={`relative bg-slate-900 rounded-2xl p-6 border-2 ${isCompletedClass} ${hoverEffect} shadow-lg overflow-hidden flex flex-col`}
                        >
                            {/* 완료된 업적 테두리 반짝임 효과 */}
                            {ach.isCompleted && (
                                <>
                                    <div className="absolute inset-0 border-4 border-emerald-400 rounded-2xl animate-pulse-border" />
                                    <style jsx>{`
                                        @keyframes pulse-border {
                                            0% { border-color: rgba(52, 211, 153, 0.4); }
                                            50% { border-color: rgba(52, 211, 153, 0.8); }
                                            100% { border-color: rgba(52, 211, 153, 0.4); }
                                        }
                                        .animate-pulse-border {
                                            animation: pulse-border 2s infinite;
                                        }
                                    `}</style>
                                </>
                            )}

                            {/* 카테고리 뱃지 - 더 작고 세련되게 */}
                            <div className={`absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${styles.bgColor} ${styles.color} border ${styles.borderColor}/30`}>
                                {ach.category}
                            </div>
                            <br/>
                            {/* 헤더 부분: 아이콘과 제목의 균형 */}
                            <div className="flex items-start gap-3 mb-3 mt-2">
                                <span className="text-2xl shrink-0">{ach.icon}</span>
                                <h2 className="text-lg font-bold leading-tight break-keep pt-1">
                                    {ach.title}
                                </h2>
                            </div>

                            {/* 설명: 조금 더 작고 깔끔하게 */}
                            <p className="text-slate-400 text-xs leading-relaxed mb-4 min-h-[32px]">
                                {ach.description}
                            </p>

                            {/* 보상 영역: 강조된 디자인 */}
                            <div className="mt-auto">
                                <div className="flex justify-between items-center mb-2 bg-slate-950/50 p-2 rounded-lg border border-white/5">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Reward</span>
                                    <span className={`text-xs font-bold ${ach.isCompleted ? 'text-yellow-400' : 'text-emerald-400'}`}>
                                        {ach.reward.label}
                                    </span>
                                </div>

                                {/* 경험치 바 */}
                                <div className="w-full bg-slate-950 rounded-full h-1.5 border border-white/5 overflow-hidden">
                                    <div 
                                        className="h-full transition-all duration-1000"
                                        style={{ 
                                            width: `${ach.progressPercent}%`,
                                            background: ach.isCompleted ? '#f59e0b' : '#10b981',
                                            boxShadow: ach.isCompleted ? '0 0 8px #f59e0b' : '0 0 8px #10b981'
                                        }}
                                    />
                                </div>
                                
                                <div className="flex justify-between mt-1.5">
                                    <span className="text-[9px] text-slate-500 font-medium">
                                        {ach.isCompleted && ach.completedAt && `${ach.completedAt}`}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-400">
                                        {ach.isCompleted ? 'COMPLETED' : `${ach.currentProgress} / ${ach.maxProgress}`}
                                    </span>
                                </div>

                                {/* 보상 버튼: 카드 전체 높이를 고려해 하단에 고정 */}
                                <div className="mt-4">
                                    {(() => {
                                        // 1. 이미 보상을 받은 경우
                                        if (ach.isCompleted && ach.isRewarded) {
                                            return (
                                                <button 
                                                    disabled 
                                                    className="w-full py-2 bg-slate-800 text-slate-500 text-xs font-black rounded-xl border border-slate-700 cursor-not-allowed"
                                                >
                                                    수령 완료
                                                </button>
                                            );
                                        }
                                        // 2. 달성은 했지만 아직 보상을 안 받은 경우 (활성화)
                                        if (ach.isCompleted && !ach.isRewarded) {
                                            return (
                                                <button 
                                                    className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition-all active:translate-y-1 active:shadow-none shadow-[0_4px_0_rgb(5,150,105)]"
                                                    onClick={() => {/* 보상 수령 로직 */}}
                                                >
                                                    보상 받기
                                                </button>
                                            );
                                        }
                                        // 3. 아직 달성하지 못한 경우 (비활성화)
                                        return (
                                            <button 
                                                disabled 
                                                className="w-full py-2 bg-slate-800/50 text-slate-600 text-xs font-black rounded-xl border border-white/5 cursor-not-allowed"
                                            >
                                                진행 중...
                                            </button>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="max-w-7xl mx-auto mt-12 text-center text-slate-500 text-sm">
                <p>&copy; 2026 Board Game. All rights reserved.</p>
            </div>
        </div>
    );
}