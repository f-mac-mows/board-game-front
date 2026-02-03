import React, { useState } from 'react';
import { AnyGameLog, YachtLog } from '@/types/log';
import { CategoryLabel } from '@/types/game';

const DiceIcon = ({ value, size = "sm" }: { value: number, size?: "sm" | "xs" }) => {
  const dotPositions: Record<number, number[]> = {
    1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
  };
  const boxSize = size === "sm" ? "w-7 h-7" : "w-5 h-5";
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-1 h-1";

  return (
    <div className={`${boxSize} rounded-md bg-white/10 border border-white/20 grid grid-cols-3 grid-rows-3 p-1 gap-0.5 shadow-inner`}>
      {[...Array(9)].map((_, i) => (
        <div key={i} className="flex items-center justify-center">
          {dotPositions[value]?.includes(i) && (
            <div className={`${dotSize} rounded-full bg-emerald-400 shadow-[0_0_3px_rgba(52,211,153,0.8)]`} />
          )}
        </div>
      ))}
    </div>
  );
};

export const MatchLogRenderer = ({ 
  log, 
  isGroupedKeep = false, 
  groupItems = [],
  isMe = false 
}: { 
  log: AnyGameLog; 
  isGroupedKeep?: boolean; 
  groupItems?: YachtLog[];
  isMe?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 1. 게임 종료 로그는 별도 배너로 처리 (타임라인의 마침표)
  if (log.action === 'GAME_END') {
    return (
      <div className="my-6 relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-emerald-500/20"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-slate-900 px-4 py-2 border border-emerald-500/40 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.1)] flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">
              Match Completed
            </span>
            <div className="h-2 w-[1px] bg-white/10" />
            <span className="text-[9px] text-slate-500 font-mono">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. YachtDetail 보조 컴포넌트
  const YachtDetail = ({ yLog, mini = false }: { yLog: YachtLog, mini?: boolean }) => {
    const isRecord = yLog.action === 'RECORD' || yLog.action === 'TIMEOUT_AUTO_RECORD';
    
    return (
      <div className={`flex flex-col ${mini ? 'gap-0.5 opacity-70' : 'gap-1.5'}`}>
        <div className="flex items-center gap-2">
          {yLog.category && (
            <span className="text-[9px] px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 font-black tracking-tighter">
              {CategoryLabel[yLog.category]}
            </span>
          )}
          <span className={`text-[11px] font-bold ${mini ? 'text-slate-500' : 'text-slate-300'}`}>
             {yLog.action === 'ROLL' ? '주사위를 굴렸습니다' : '점수를 기록했습니다'}
          </span>
        </div>
        {yLog.diceValues && (
          <div className="flex gap-1">
            {yLog.diceValues.map((v, i) => <DiceIcon key={i} value={v} size={mini ? "xs" : "sm"} />)}
          </div>
        )}
      </div>
    );
  };

  // 3. KEEP 그룹 렌더링
  if (isGroupedKeep) {
    return (
      <div className={`pl-5 py-2 border-l relative group transition-colors ${isMe ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800'}`}>
        <div className={`absolute -left-[3.5px] top-4 w-1.5 h-1.5 rounded-full transition-colors ${isMe ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-slate-700'}`} />
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`text-[10px] font-bold transition-colors flex items-center gap-2 ${isMe ? 'text-emerald-400' : 'text-slate-500 hover:text-amber-400'}`}
        >
          {isExpanded ? '▼' : '▶'} {isMe ? '나' : log.nickname}님의 고민 흔적 ({groupItems.length}회 고정)
        </button>
        {isExpanded && (
          <div className="mt-2 flex flex-col gap-3 pl-2 border-l border-slate-800/50">
            {groupItems.map((item, idx) => (
              <div key={idx} className="flex flex-col gap-1">
                <span className="text-[8px] text-slate-600 font-mono">{new Date(item.timestamp).toLocaleTimeString()}</span>
                <div className="flex gap-1 scale-75 origin-left">
                  {item.diceValues?.map((v, i) => <DiceIcon key={i} value={v} size="xs" />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 4. 일반 로그 렌더링 (ROLL, RECORD 등)
  return (
    <div className={`group relative pl-5 py-3 border-l transition-all ${isMe ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 hover:border-slate-700'}`}>
      <div className={`absolute -left-[4.5px] top-4 w-2 h-2 rounded-full transition-colors ${isMe ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-800 group-hover:bg-emerald-500'}`} />
      <div className="flex justify-between items-center mb-1">
        <span className={`text-[10px] font-black uppercase tracking-widest ${isMe ? 'text-emerald-400' : 'text-slate-400'}`}>
          {log.nickname} {isMe && '(YOU)'}
        </span>
        <span className="text-[9px] text-slate-600 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
      </div>
      <YachtDetail yLog={log as YachtLog} />
    </div>
  );
};