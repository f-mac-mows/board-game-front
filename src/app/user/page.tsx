"use client";

import { useUserStore } from '@/store/useUserStore';
import { Wallet, Sparkles, Award, Lock, ChevronRight, TrendingUp } from 'lucide-react';

export default function UserProfilePage() {
    const { user } = useUserStore();

    if (!user) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. 자산 현황 섹션 (Assets) */}
            <section>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-400">
                    <Wallet size={18} /> 보유 자산 상세
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 골드 카드 */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <CoinsIcon size={80} className="text-yellow-500" />
                        </div>
                        <p className="text-sm text-slate-500 font-medium">보유 골드</p>
                        <div className="flex items-baseline gap-2 mt-2">
                            <h4 className="text-3xl font-black text-yellow-500">
                                {user.asset.gold.toLocaleString()}
                            </h4>
                            <span className="text-slate-400 font-bold">GOLD</span>
                        </div>
                        <button className="mt-4 text-xs text-slate-500 hover:text-yellow-500 flex items-center gap-1 transition-colors">
                            사용 내역 보기 <ChevronRight size={12} />
                        </button>
                    </div>

                    {/* 포인트 카드 */}
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Sparkles size={80} className="text-blue-500" />
                        </div>
                        <p className="text-sm text-slate-500 font-medium">누적 포인트</p>
                        <div className="flex items-baseline gap-2 mt-2">
                            <h4 className="text-3xl font-black text-blue-500">
                                {user.asset.point.toLocaleString()}
                            </h4>
                            <span className="text-slate-400 font-bold">PT</span>
                        </div>
                        <button className="mt-4 text-xs text-slate-500 hover:text-blue-500 flex items-center gap-1 transition-colors">
                            포인트 상점 이동 <ChevronRight size={12} />
                        </button>
                    </div>
                </div>
            </section>

            {/* 2. 장착 중인 칭호 & 대표 업적 (Preview) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <section className="lg:col-span-2">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-400">
                        <Award size={18} /> 최근 획득한 업적
                    </h3>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-2">
                        {/* 업적 리스트 (임시) */}
                        <div className="space-y-1">
                            {[
                                { name: "주사위의 입문자", desc: "야추 다이스 1회 플레이", date: "2026.01.30", color: "text-green-400" },
                                { name: "첫 승리의 맛", desc: "아무 게임에서 1회 승리", date: "2026.01.31", color: "text-blue-400" },
                            ].map((ach, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-800/50 rounded-2xl transition-colors">
                                    <div className={`p-3 bg-slate-950 rounded-xl ${ach.color}`}>
                                        <Award size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold">{ach.name}</h5>
                                        <p className="text-xs text-slate-500">{ach.desc}</p>
                                    </div>
                                    <span className="text-xs text-slate-600 font-mono">{ach.date}</span>
                                </div>
                            ))}
                            {/* 잠금된 업적 예시 */}
                            <div className="flex items-center gap-4 p-4 opacity-40 grayscale">
                                <div className="p-3 bg-slate-950 rounded-xl">
                                    <Lock size={24} />
                                </div>
                                <div className="flex-1">
                                    <h5 className="font-bold">주사위의 신</h5>
                                    <p className="text-xs text-slate-500">야추 다이스에서 10연승 달성</p>
                                </div>
                                <span className="text-xs text-slate-600">Locked</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. 간단한 랭킹 현황 (Sidebar Style) */}
                <section>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-400">
                        <TrendingUp size={18} /> 종합 랭킹
                    </h3>
                    <div className="bg-gradient-to-br from-slate-900 to-blue-900/20 border border-slate-800 rounded-3xl p-6 text-center">
                        <p className="text-xs text-slate-500 uppercase tracking-widest">Global Rank</p>
                        <h4 className="text-4xl font-black mt-2 text-white italic">#1,248</h4>
                        <div className="mt-6 space-y-3">
                            <div className="flex justify-between text-sm border-b border-slate-800 pb-2">
                                <span className="text-slate-500">상위</span>
                                <span className="text-blue-400 font-bold">14.2%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">다음 티어까지</span>
                                <span className="text-slate-300">124 MMR</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

// 아이콘 보조 컴포넌트
function CoinsIcon({ size, className }: { size: number, className: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="8" cy="8" r="6"/><path d="M18 8c0 4.42-3.58 8-8 8a8.003 8.003 0 0 1-7.11-4.39"/><path d="M23 12a9 9 0 0 1-15.56 6.11"/>
        </svg>
    );
}