import { useMemo } from 'react';
import { useAchievements } from '@/hooks/useAchievements';
import MiniRankingWidget from '@/components/user/MiniRankingWidget';
import { Wallet, Sparkles, Award, Zap, Trophy } from 'lucide-react';
import { useMe } from '@/hooks/useMe';

export default function UserProfilePage() {
    // ✨ useMe에서 직접 최신 정보를 구독합니다.
    const { data: user, isLoading: isUserLoading, isError } = useMe();
    const { achievements, isLoading: isAchLoading } = useAchievements();

    // Stats 계산 (Optional Chaining으로 안전하게)
    const stats = useMemo(() => {
        const accountStat = user?.astat;
        const current = accountStat?.currentExp ?? 0;
        const required = accountStat?.requiredExp ?? 1000;
        const level = accountStat?.level ?? 1;
        const percent = Math.min((current / required) * 100, 100);
        
        return { current, required, level, percent };
    }, [user]);

    // 1. 데이터 로딩 중
    if (isUserLoading) {
        return (
            <div className="flex justify-center items-center h-64 text-slate-500 animate-pulse font-bold">
                사용자 최신 데이터를 불러오는 중입니다...
            </div>
        );
    }

    // 2. 데이터가 없거나 에러 발생
    if (isError || !user) {
        return <div className="p-20 text-center text-slate-500">정보를 불러올 수 없습니다. 다시 로그인해 주세요.</div>;
    }

    const recentAchievements = useMemo(() => {
        if (!achievements) return [];
        return achievements
            .filter(a => a.completed) // 달성 완료된 것만
            .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime()) // 최신순
            .slice(0, 3); // 3개만 표시
    }, [achievements]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 레벨 섹션 */}
            <section className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-4xl p-8 shadow-2xl">
                <div className="relative z-10">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                <Zap size={14} className="fill-emerald-500" /> Account Progression
                            </p>
                            <h2 className="text-5xl font-black text-white tracking-tighter">
                                LV. <span className="text-emerald-400">{stats.level}</span>
                            </h2>
                        </div>
                        <div className="text-right">
                            <span className="text-xl font-black text-white">{stats.current.toLocaleString()}</span>
                            <span className="text-xs text-slate-500 font-bold"> / {stats.required.toLocaleString()} EXP</span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-950 h-5 rounded-2xl p-1 shadow-inner">
                        <div 
                            className="h-full bg-linear-to-r from-emerald-500 to-cyan-500 rounded-xl transition-all duration-1000 ease-out"
                            style={{ width: `${stats.percent}%` }}
                        />
                    </div>
                </div>
            </section>

            {/* 자산 섹션 */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-4xl group hover:border-yellow-500/50 transition-all">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Available Balance</p>
                    <div className="flex items-baseline gap-2 mt-3">
                        <h4 className="text-4xl font-black text-yellow-500">{user.asset?.gold?.toLocaleString() ?? 0}</h4>
                        <span className="text-slate-500 font-black text-sm">GOLD</span>
                    </div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-4xl group hover:border-blue-500/50 transition-all">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Accumulated Points</p>
                    <div className="flex items-baseline gap-2 mt-3">
                        <h4 className="text-4xl font-black text-blue-500">{user.asset?.point?.toLocaleString() ?? 0}</h4>
                        <span className="text-slate-500 font-black text-sm">PT</span>
                    </div>
                </div>
            </section>

            {/* [Section 2] 업적 섹션 */}
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

                {/* [Section 3] 랭킹 섹션 */}
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