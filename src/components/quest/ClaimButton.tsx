"use client";

import { useState } from 'react';
import { Gift, CheckCircle2, Loader2 } from 'lucide-react';
import { triggerRewardConfetti } from '@/lib/rewardEffect';

interface Props {
    onClaim: () => Promise<void> | void;
    isCompleted: boolean;
    isClaimed: boolean;
}

export default function ClaimButton({ onClaim, isCompleted, isClaimed }: Props) {
    const [isPending, setIsPending] = useState(false);

    const handleClaim = async () => {
        if (!isCompleted || isClaimed || isPending) return;

        try {
            setIsPending(true);
            await onClaim(); // API 호출
            triggerRewardConfetti(); // 아까 만든 confetti 실행 (이건 라이브러리 필요)
        } finally {
            setIsPending(false);
        }
    };

    // 1. 이미 수령한 경우
    if (isClaimed) {
        return (
            <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20 font-black text-[10px] uppercase tracking-widest">
                <CheckCircle2 size={14} /> Claimed
            </div>
        );
    }

    // 2. 수령 가능한 경우 또는 로딩/미완료
    return (
        <button
            onClick={handleClaim}
            disabled={!isCompleted || isPending}
            className={`
                relative overflow-hidden group px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.15em] transition-all duration-300 active:scale-95
                ${isCompleted 
                    ? 'bg-linear-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-900/20 hover:brightness-110 cursor-pointer' 
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed'}
            `}
        >
            {/* 반짝이는 광원 효과 (Shine Effect) */}
            {isCompleted && !isPending && (
                <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-linear-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine" />
            )}

            <div className="flex items-center justify-center gap-2">
                {isPending ? (
                    <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Processing</span>
                    </>
                ) : (
                    <>
                        <Gift size={14} className={isCompleted ? "animate-bounce" : ""} />
                        <span>Get Reward</span>
                    </>
                )}
            </div>
        </button>
    );
}