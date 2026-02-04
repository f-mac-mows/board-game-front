import { useState } from 'react';
import { AnyGameLog, YachtLog } from '@/types/log';
import { CategoryLabel } from '@/types/game';

// 주사위 아이콘 컴포넌트
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
  isMe = false,
  formattedTime // [추가] 부모로부터 전달받은 보정된 시간
}: { 
  log: AnyGameLog; 
  isGroupedKeep?: boolean; 
  groupItems?: YachtLog[];
  isMe?: boolean;
  formattedTime: string; // [추가]
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 개별 타임스탬프 변환 함수 (KEEP 그룹 내부용)
  const formatTime = (ts: string) => {
    const date = new Date(ts.endsWith('Z') ? ts : `${ts}Z`);
    return date.toLocaleTimeString('ko-KR', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // 1. 게임 종료 배너
  if (log.action === 'GAME_END') {
    return (
      <div className="my-12 relative px-2 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]"></div>
        </div>
        <div className="relative flex justify-center">
          <div className="bg-slate-950 px-8 py-3 border-2 border-emerald-500/50 rounded-2xl flex flex-col items-center gap-1 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.5em]">Match Concluded</span>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-2xl font-black text-white tracking-tighter italic">
                {log.diceValues?.[0]} <span className="text-emerald-500/50 mx-1">:</span> {log.diceValues?.[1]}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. 공통 타임라인 레이아웃 Wrapper
  const TimelineItem = ({ children, isKeep = false }: { children: React.ReactNode, isKeep?: boolean }) => (
    <div className={`ml-4 pl-8 relative transition-all border-l-2 
      ${isMe ? 'border-emerald-500/30' : 'border-slate-800'}
      ${isKeep ? 'py-2 bg-blue-500/2' : 'py-6'}
    `}>
      <div className={`absolute -left-2.25 top-6 w-4 h-4 rounded-full border-4 border-slate-950 z-10
        ${isMe ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-700'}`} 
      />
      {children}
    </div>
  );

  // 3. YachtDetail
  const YachtDetail = ({ yLog }: { yLog: YachtLog }) => {
    const isRecord = yLog.action === 'RECORD';
    const isTimeout = yLog.action === 'TIMEOUT_AUTO_RECORD';

    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-[9px] px-2 py-0.5 rounded-sm font-black tracking-tighter uppercase
            ${isRecord ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
              isTimeout ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
              'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}
          `}>
            {yLog.action}
          </span>
          {yLog.category && (
            <span className="text-[10px] text-amber-400 font-bold tracking-tight bg-amber-400/5 px-1.5 rounded">
              {CategoryLabel[yLog.category]}
            </span>
          )}
          <span className="text-[11px] text-slate-400 font-medium">
            {isTimeout ? '시간 초과 자동 기록' : isRecord ? '점수 기록 완료' : '주사위 굴리기'}
          </span>
        </div>
        {yLog.diceValues && yLog.diceValues.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {yLog.diceValues.map((v, i) => <DiceIcon key={i} value={v} size="sm" />)}
          </div>
        )}
      </div>
    );
  };

  // 4. KEEP 그룹 렌더링
  if (isGroupedKeep) {
    return (
      <TimelineItem isKeep={true}>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
        >
          <span className={`transition-transform duration-200 ${isExpanded ? 'rotate-90 text-emerald-400' : ''}`}>▶</span>
          {log.nickname} is keeping ({groupItems.length} steps)
        </button>
        {isExpanded && (
          <div className="mt-4 space-y-3 pl-2 animate-in fade-in slide-in-from-left-2">
            {groupItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 group/item">
                <span className="text-[8px] text-slate-600 font-mono w-14 shrink-0">
                  {formatTime(item.timestamp)}
                </span>
                <div className="flex gap-1 items-center opacity-60 group-hover/item:opacity-100 transition-opacity scale-90 origin-left">
                  {item.diceValues?.map((v, i) => <DiceIcon key={i} value={v} size="xs" />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </TimelineItem>
    );
  }

  // 5. 일반 로그 렌더링
  return (
    <TimelineItem>
      <div className="flex justify-between items-start mb-3">
        <div className="flex flex-col">
          <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${isMe ? 'text-emerald-400' : 'text-slate-500'}`}>
            {log.nickname} {isMe && <span className="ml-1 text-[8px] opacity-50">● YOU</span>}
          </span>
        </div>
        <span className="text-[9px] text-slate-600 font-mono mt-0.5">
          {formattedTime}
        </span>
      </div>
      <YachtDetail yLog={log as YachtLog} />
    </TimelineItem>
  );
};