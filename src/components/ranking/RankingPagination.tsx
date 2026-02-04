"use client";

import { cn } from "@/lib/utils";

interface PaginationProps {
    currentPage: number;
    onPageChange: (page: number) => void;
    hasMore: boolean;
}

export default function RankingPagination({ currentPage, onPageChange, hasMore }: PaginationProps) {
    return (
        <div className="flex justify-center items-center gap-4 mt-8">
            <button
                disabled={currentPage === 0}
                onClick={() => onPageChange(currentPage - 1)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
                이전
            </button>
            <span className="text-gray-400 font-mono">
                PAGE <span className="text-white font-bold">{currentPage + 1}</span>
            </span>
            <button
                disabled={!hasMore}
                onClick={() => onPageChange(currentPage + 1)}
                className="px-4 py-2 rounded-lg bg-gray-800 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
            >
                다음
            </button>
        </div>
    );
}