"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export default function RankingTabs({ currentCategory, currentCriteria }: any) {
    const categories = [
        { key: "user", label: "통합" },
        { key: "YACHT", label: "야추" },
    ];

    // 카테고리에 따라 선택 가능한 기준 필터링
    const getCriterias = (cat: string) => {
        if (cat === "user") return [
            { key: "level", label: "레벨" },
            { key: "played", label: "판수" }
        ];
        return [
            { key: "mmr", label: "MMR" },
            { key: "level", label: "레벨" }
        ];
    };

    const criterias = getCriterias(currentCategory);

    return (
        <div className="flex flex-col gap-4 mb-8">
            <div className="flex justify-center gap-2">
                {categories.map((cat) => {
                    // 카테고리 이동 시, 해당 카테고리에 없는 criteria면 기본값(level)으로 변경
                    const validCriteria = getCriterias(cat.key).some(c => c.key === currentCriteria) 
                        ? currentCriteria 
                        : "level";

                    return (
                        <Link
                            key={cat.key}
                            href={`/ranking/${cat.key}/${validCriteria}`}
                            className={cn(
                                "px-6 py-2 rounded-lg font-bold transition-all",
                                currentCategory === cat.key ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"
                            )}
                        >
                            {cat.label}
                        </Link>
                    );
                })}
            </div>
            
            <div className="flex justify-center gap-6 border-b border-gray-800">
                {criterias.map((cri) => (
                    <Link
                        key={cri.key}
                        href={`/ranking/${currentCategory}/${cri.key}`}
                        className={cn(
                            "pb-2 px-4 text-sm font-bold border-b-2 transition-all",
                            currentCriteria === cri.key ? "border-blue-500 text-blue-500" : "border-transparent text-gray-500"
                        )}
                    >
                        {cri.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}