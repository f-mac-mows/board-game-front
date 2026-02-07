"use client";

import { StatInfo } from '@/types/auth';
import { GameTypeCode, GAME_TYPE_CONFIG } from '@/types/rooms';
import { Trophy, Medal, Award } from 'lucide-react';

interface StatCardProps {
    stat: StatInfo;
    onClick: () => void;
    calculateWinRate: (stat: StatInfo) => string;
}

export default function StatCard({ stat, onClick, calculateWinRate }: StatCardProps) {
    const getTierInfo = (mmr: number) => {
        if (mmr >= 2000) return { icon: <Trophy size={18} className="text-yellow-400" />, label: "Diamond", color: "from-yellow-500/10", border: "border-yellow-500/20" };
        if (mmr >= 1500) return { icon: <Award size={18} className="text-blue-400" />, label: "Platinum", color: "from-blue-400/10", border: "border-blue-400/20" };
        if (mmr >= 1200) return { icon: <Medal size={18} className="text-slate-400" />, label: "Gold", color: "from-slate-400/10", border: "border-slate-400/20" };
        return { icon: <Medal size={18} className="text-orange-600" />, label: "Bronze", color: "from-orange-600/10", border: "border-orange-600/20" };
    };

    const tier = getTierInfo(stat.mmr);
    const gameInfo = GAME_TYPE_CONFIG[stat.gameType as GameTypeCode];
    const winRate = calculateWinRate(stat);

    return (
        <button 
            onClick={onClick}
            className={`relative group flex flex-col p-6 bg-slate-900/40 border ${tier.border} rounded-4xl hover:bg-slate-800/60 transition-all text-left overflow-hidden shadow-lg`}
        >
            <div className={`absolute inset-0 bg-linear-to-br ${tier.color} to-transparent opacity-40`} />
            <div className="relative z-10 flex flex-col h-full w-full">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-slate-950/80 rounded-2xl shadow-inner">{tier.icon}</div>
                    <div className="flex flex-col items-end font-mono">
                        <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">Level</span>
                        <span className="text-xl font-black text-white leading-none">{stat.level}</span>
                    </div>
                </div>
                <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">
                    {gameInfo?.description || stat.gameType}
                </h3>
                <p className="text-xs text-slate-500 font-bold tracking-widest uppercase mb-4">{tier.label} Division</p>
                <div className="mt-auto pt-4 border-t border-slate-800/50 flex justify-between items-center font-mono">
                    <div>
                        <p className="text-[9px] text-slate-600 font-black uppercase">Rating</p>
                        <p className="text-md font-bold text-slate-300">{stat.mmr} RP</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-slate-600 font-black uppercase">Win Rate</p>
                        <p className="text-md font-bold text-emerald-500">{winRate}%</p>
                    </div>
                </div>
            </div>
        </button>
    );
}