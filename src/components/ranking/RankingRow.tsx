"use client";

import { RankingResponse } from "@/types/rank";
import { cn } from "@/lib/utils";

interface Props {
  item: RankingResponse;
  isMe: boolean;
}

export default function RankingRow({ item, isMe }: Props) {
  return (
    <tr className={cn(
      "group transition-colors duration-200",
      isMe ? "bg-blue-600/10 hover:bg-blue-600/20" : "hover:bg-gray-800/40"
    )}>
      <td className="py-5 px-6 text-center">
        <span className={cn(
          "font-mono text-lg font-bold",
          isMe ? "text-blue-400" : "text-gray-500"
        )}>
          {item.rank}
        </span>
      </td>
      <td className="py-5 px-6">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
            {item.title}
          </span>
          <span className={cn(
            "font-semibold tracking-tight",
            isMe ? "text-blue-400" : "text-gray-200"
          )}>
            {item.nickname}
            {isMe && (
              <span className="ml-2 text-[9px] bg-blue-500 text-white px-1.5 py-0.5 rounded-sm uppercase font-black">
                YOU
              </span>
            )}
          </span>
        </div>
      </td>
      <td className="py-5 px-6 text-right">
        <span className={cn(
          "font-mono text-lg font-black",
          isMe ? "text-blue-400" : "text-yellow-500/80"
        )}>
          {item.score.toLocaleString()}
        </span>
      </td>
    </tr>
  );
}