"use client";

import { useState, useEffect, useMemo } from 'react';
import { Clock, RefreshCw } from 'lucide-react';

export default function QuestTimer() {
    const [timeLeft, setTimeLeft] = useState({
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            
            // 1. 현재 시간을 KST(Asia/Seoul) 기준으로 변환
            const kstNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
            
            // 2. KST 기준 다음 날 00:00:00 설정
            const target = new Date(kstNow);
            target.setHours(24, 0, 0, 0); 

            const diff = target.getTime() - kstNow.getTime();

            if (diff <= 0) {
                return { hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60)
            };
        };

        // 초기 계산
        setTimeLeft(calculateTimeLeft());

        // 1초마다 업데이트
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // 숫자를 00 형식으로 포맷팅
    const formatNumber = (num: number) => String(num).padStart(2, '0');

    return (
        <div className="flex flex-col items-center lg:items-end">
            <div className="flex items-center gap-1.5 text-slate-500 mb-2">
                <RefreshCw size={12} className="animate-spin-slow" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Next Reset In</span>
            </div>
            
            <div className="flex items-center gap-2 font-mono">
                <TimeUnit value={formatNumber(timeLeft.hours)} label="H" />
                <span className="text-slate-700 font-bold animate-pulse">:</span>
                <TimeUnit value={formatNumber(timeLeft.minutes)} label="M" />
                <span className="text-slate-700 font-bold animate-pulse">:</span>
                <TimeUnit value={formatNumber(timeLeft.seconds)} label="S" />
            </div>
        </div>
    );
}

function TimeUnit({ value, label }: { value: string; label: string }) {
    return (
        <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-black text-white tracking-tighter">
                {value}
            </span>
            <span className="text-[10px] font-bold text-slate-600">
                {label}
            </span>
        </div>
    );
}