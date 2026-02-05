"use client";

import QuestTimer from '@/components/quest/QuestTimer';
import { useQuests } from '@/hooks/useQuests';
import { Loader2, Gift, CheckCircle, Home } from 'lucide-react';
import {useRouter} from 'next/navigation';

export default function DailyQuestPage() {
    const { quests, isLoading, claimReward, isClaiming } = useQuests();
    const router = useRouter();

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" /></div>;

    const returnToHome = () => {
        router.push('/');
    }

    return (
        <div className="min-h-screen bg-slate-950 max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-black text-white italic tracking-tighter">DAILY MISSIONS</h1>
                <p className="text-slate-500 text-sm mt-1">매일 새로운 미션을 완료하고 보상을 획득하세요.</p>
                <button 
                    onClick={returnToHome}
                    className="ml-auto flex items-center gap-2 px-6 py-3 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 rounded-xl transition-all group"
                >
                    <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:animate-ping" />
                    <span className="text-xs font-bold text-slate-400 group-hover:text-white uppercase tracking-tighter">
                        Return Home
                    </span>
                    <Home size={16} className="text-slate-500 group-hover:text-blue-400" />
                </button>
            </header>
            
            <QuestTimer/>

            <div className="grid gap-4">
                {quests.map((q: any) => {
                    const progress = (q.currentValue / q.targetValue) * 100;
                    const canClaim = q.completed && !q.claimed;

                    return (
                        <div key={q.id} className={`group relative bg-slate-900 border-2 rounded-4xl p-6 transition-all ${canClaim ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-slate-800'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-white">{q.title}</h3>
                                    <p className="text-sm text-slate-500">{q.description}</p>
                                </div>
                                <div className="bg-slate-800 px-3 py-1 rounded-xl">
                                    <span className="text-xs font-black text-emerald-400 uppercase">{q.reward.label}</span>
                                </div>
                            </div>

                            {/* 프로그레스 바 */}
                            <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden mb-4">
                                <div 
                                    className={`absolute top-0 left-0 h-full transition-all duration-1000 ${q.completed ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                    style={{ width: `${Math.min(100, progress)}%` }}
                                />
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-400">
                                    {q.currentValue} / {q.targetValue}
                                </span>

                                {q.isClaimed ? (
                                    <div className="flex items-center gap-1 text-slate-600 font-bold text-sm">
                                        <CheckCircle size={16} /> 획득 완료
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => claimReward(q.id)}
                                        disabled={!q.completed || isClaiming}
                                        className={`px-6 py-2 rounded-2xl font-black text-sm transition-all ${
                                            canClaim 
                                            ? 'bg-emerald-500 text-white hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-bounce-subtle' 
                                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                        }`}
                                    >
                                        {isClaiming ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : '보상 받기'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}