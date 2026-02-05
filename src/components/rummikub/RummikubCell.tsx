"use client";

import { useDroppable } from "@dnd-kit/core";

interface Props {
  id: string; // "board-0-0", "hand-1-5" 등
  children?: React.ReactNode;
}

export default function RummikubCell({ id, children }: Props) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`
        w-10 h-14 sm:w-12 sm:h-16 rounded-lg border flex items-center justify-center transition-colors
        ${isOver ? "bg-blue-500/20 border-blue-400" : "bg-slate-900/50 border-slate-800"}
      `}
    >
      {children}
    </div>
  );
}