"use client";

import { useTitles } from '@/hooks/useTitles';
import { Award, CheckCircle2, Lock, Sparkles, Loader2 } from 'lucide-react';

export default function TitleManagementPage() {
    // 훅에서 실제 데이터와 장착 함수를 가져옵니다.
    const { titles, isLoading, equipTitle, isEquipping } = useTitles();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="animate-spin text-emerald-500" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-6 animate-in fade-in duration-700">
            <header className="mb-10">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    <Award className="text-emerald-400" size={32} /> 나의 칭호 관리
                </h1>
                <p className="text-slate-500 mt-2">업적을 달성하고 특별한 칭호를 획득하세요.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. 서버에서 가져온 실제 칭호 목록 렌더링 */}
                {titles.length > 0 ? (
                    titles.map((title) => (
                        <button
                            key={title.code}
                            disabled={isEquipping || title.equipped}
                            onClick={() => equipTitle(title.code)}
                            className={`relative p-6 rounded-[2rem] border-2 transition-all text-left group ${
                                title.equipped 
                                ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                            }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <span 
                                        className="text-lg font-black tracking-tight"
                                        style={{ 
                                            color: title.colorCode,
                                            textShadow: `0 0 10px ${title.colorCode}44`
                                        }}
                                    >
                                        [{title.name}]
                                    </span>
                                    <p className="text-xs text-slate-500 mt-1">{title.description}</p>
                                </div>
                                {title.equipped ? (
                                    <CheckCircle2 className="text-emerald-500" size={24} />
                                ) : (
                                    <Sparkles className="text-slate-700 group-hover:text-slate-400 transition-colors" size={20} />
                                )}
                            </div>

                            {title.equipped && (
                                <div className="mt-4 inline-block px-3 py-1 bg-emerald-500 text-[10px] font-black text-white rounded-full uppercase">
                                    Equipped
                                </div>
                            )}
                        </button>
                    ))
                ) : (
                    /* 칭호가 하나도 없을 때 보여줄 빈 상태 */
                    <div className="col-span-full py-20 text-center bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-slate-800">
                        <p className="text-slate-500 font-bold italic">획득한 칭호가 없습니다.</p>
                        <p className="text-xs text-slate-600 mt-1">업적을 달성하여 보상을 획득하세요!</p>
                    </div>
                )}

                {/* 2. 잠긴 칭호 예시 (선택 사항) */}
                <div className="p-6 rounded-[2rem] border-2 border-slate-900 bg-slate-950/50 opacity-50 flex items-center gap-4">
                    <div className="p-3 bg-slate-900 rounded-2xl">
                        <Lock size={20} className="text-slate-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-600">비밀 칭호</p>
                        <p className="text-[10px] text-slate-700 font-medium">특정 조건 달성 시 공개</p>
                    </div>
                </div>
            </div>
        </div>
    );
}