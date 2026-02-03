import { useState } from 'react';
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

  // 1. 게임 종료 배너
  if (log.action === 'GAME_END') {
    return (
      <div className="my-8 relative px-2">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-slate-950 px-6 py-2 border border-emerald-500/40 rounded-xl flex items-center gap-3">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Match Over</span>
            <div className="h-2 w-px bg-emerald-500/20" />
            <span className="text-[11px] font-bold text-white tracking-tighter">
              {log.diceValues?.[0]} : {log.diceValues?.[1]}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 2. YachtDetail 개선 (Action별 분기 처리)
  const YachtDetail = ({ yLog }: { yLog: YachtLog }) => {
    const isRecord = yLog.action === 'RECORD';
    const isTimeout = yLog.action === 'TIMEOUT_AUTO_RECORD';

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {/* Action Label */}
          <span className={`text-[9px] px-2 py-0.5 rounded-sm font-black tracking-tighter uppercase
            ${isRecord ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
              isTimeout ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}
          `}>
            {yLog.action}
          </span>
          
          {yLog.category && (
            <span className="text-[10px] text-amber-400 font-bold tracking-tight">
              [{CategoryLabel[yLog.category]}]
            </span>
          )}

          <span className="text-[11px] text-slate-400">
            {isTimeout ? '시간 초과로 자동 기록되었습니다' : 
             isRecord ? '점수를 기록했습니다' : '주사위를 굴렸습니다'}
          </span>
        </div>

        {/* Dice List */}
        {yLog.diceValues && yLog.diceValues.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {yLog.diceValues.map((v, i) => (
              <DiceIcon key={i} value={v} size="sm" />
            ))}
          </div>
        )}
      </div>
    );
  };

  // 3. KEEP 그룹 렌더링 (디자인 소폭 강화)
  if (isGroupedKeep) {
    return (
      <div className={`ml-1 pl-5 py-2 border-l-2 relative transition-all 
        ${isMe ? 'border-blue-500/30 bg-blue-500/5' : 'border-slate-800'}`}>
        <div className={`absolute -left-1.5 top-5 w-2.5 h-2.5 rounded-full border-2 border-slate-950
          ${isMe ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`} 
        />
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
        >
          <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
          {log.nickname} is keeping dice ({groupItems.length} steps)
        </button>
        {isExpanded && (
          <div className="mt-3 flex flex-col gap-4 pl-3 border-l border-white/5">
            {groupItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <span className="text-[8px] text-slate-600 font-mono w-14 shrink-0">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <div className="flex gap-1 items-center opacity-80 scale-90 origin-left">
                  {item.diceValues?.map((v, i) => <DiceIcon key={i} value={v} size="xs" />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 4. 일반 로그 렌더링
  return (
    <div className={`ml-1 pl-5 py-4 border-l-2 relative transition-all 
      ${isMe ? 'border-emerald-500/50 bg-emerald-500/3' : 'border-slate-800'}`}>
      <div className={`absolute -left-1.5 top-6 w-2.5 h-2.5 rounded-full border-2 border-slate-950
        ${isMe ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`} />
      <div className="flex justify-between items-center mb-2">
        <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${isMe ? 'text-emerald-400' : 'text-slate-500'}`}>
          {log.nickname} {isMe && '• YOU'}
        </span>
        <span className="text-[9px] text-slate-600 font-mono tracking-tighter">
          {new Date(log.timestamp).toLocaleTimeString()}
        </span>
      </div>
      <YachtDetail yLog={log as YachtLog} />
    </div>
  );
};