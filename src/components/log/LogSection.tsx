import { useEffect, useRef } from 'react';
import { useLogs } from '@/hooks/useLogs';
import { MatchLogRenderer } from './MatchLogRenderer';
import { GameTypeCode } from '@/types/rooms';
import { YachtLog } from '@/types/log';

interface LogSectionProps {
    gameId: number;
    gameType: GameTypeCode | null;
    nickname: string;
}

/**
 * UTC 타임스탬프를 한국 시간(KST) 정보로 변환하는 유틸 함수
 */
const getKSTInfo = (timestamp: string) => {
    // 서버 데이터(UTC) 끝에 'Z'가 없다면 붙여서 Date 객체 생성
    const date = new Date(timestamp.endsWith('Z') ? timestamp : `${timestamp}Z`);
    
    // 날짜 구분용 포맷 (예: 2026년 2월 4일 수요일)
    const dateString = date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'short',
    });

    // 개별 로그 표시용 시간 포맷 (예: 17:05)
    const timeString = date.toLocaleTimeString('ko-KR', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
    });

    return { dateString, timeString };
};

export function LogSection({ gameId, gameType, nickname }: LogSectionProps) {
    const { 
        logs, 
        isLoading, 
        isError, 
        fetchMore, 
        hasNextPage, 
        isFetchingMore 
    } = useLogs(gameId, gameType, true);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const bottomObserverRef = useRef<HTMLDivElement>(null);
    const isFirstRender = useRef(true);

    // [스크롤 로직] 초기 로드 시 최상단 강제 고정
    useEffect(() => {
        if (!isLoading && logs.length > 0 && isFirstRender.current) {
            const container = scrollContainerRef.current;
            if (container) {
                requestAnimationFrame(() => {
                    container.scrollTo({ top: 0 });
                    setTimeout(() => { container.scrollTop = 0; }, 0);
                });
                isFirstRender.current = false;
            }
        }
    }, [isLoading, logs.length]);

    // [인피니티 스크롤] 하단 감지
    useEffect(() => {
        if (!bottomObserverRef.current || !hasNextPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isFetchingMore) {
                    fetchMore();
                }
            },
            { 
                root: scrollContainerRef.current,
                rootMargin: '200px',
                threshold: 0 
            }
        );

        observer.observe(bottomObserverRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingMore, logs.length]);

    // [렌더링 로직] 날짜 구분선 및 KEEP 그룹화 처리
    const renderGroupedLogs = () => {
        const elements: React.ReactNode[] = [];
        let keepGroup: YachtLog[] = [];
        let lastDate: string | null = null; // 이전 로그의 날짜를 추적

        logs.forEach((log) => {
            const { dateString, timeString } = getKSTInfo(log.timestamp);

            // 1. 날짜가 바뀌는 지점에 구분선 삽입
            if (dateString !== lastDate) {
                elements.push(
                    <div key={`date-divider-${dateString}`} className="py-10 flex flex-col items-center gap-2">
                        <div className="h-px w-16 bg-slate-800" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                            {dateString}
                        </span>
                    </div>
                );
                lastDate = dateString;
            }

            // 2. 로그 액션에 따른 분류
            if (log.action === 'KEEP') {
                keepGroup.push(log as YachtLog);
            } else {
                // 이전에 쌓인 KEEP 그룹이 있다면 먼저 렌더링
                if (keepGroup.length > 0) {
                    const firstKeepTime = getKSTInfo(keepGroup[0].timestamp).timeString;
                    elements.push(
                        <MatchLogRenderer 
                            key={`group-${keepGroup[0].id}`} 
                            log={keepGroup[0]} 
                            isGroupedKeep={true} 
                            groupItems={[...keepGroup]} 
                            isMe={keepGroup[0].nickname === nickname}
                            formattedTime={firstKeepTime}
                        />
                    );
                    keepGroup = [];
                }
                
                // 일반 로그 렌더링
                elements.push(
                    <MatchLogRenderer 
                        key={log.id} 
                        log={log} 
                        isMe={log.nickname === nickname} 
                        formattedTime={timeString}
                    />
                );
            }
        });

        // 리스트가 끝난 후 남은 KEEP 그룹 처리
        if (keepGroup.length > 0) {
            const lastKeepTime = getKSTInfo(keepGroup[0].timestamp).timeString;
            elements.push(
                <MatchLogRenderer 
                    key="group-last" 
                    log={keepGroup[0]} 
                    isGroupedKeep={true} 
                    groupItems={keepGroup} 
                    isMe={keepGroup[0].nickname === nickname}
                    formattedTime={lastKeepTime}
                />
            );
        }
        return elements;
    };

    if (isLoading) return (
        <div className="py-20 text-center animate-pulse">
            <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest italic">
                Synchronizing Timeline...
            </span>
        </div>
    );

    if (isError) return (
        <div className="py-20 text-center text-rose-500 text-[10px] font-black uppercase">
            Data Retrieval Failed.
        </div>
    );

    return (
        <div 
            ref={scrollContainerRef}
            className="relative max-h-125 overflow-y-auto pr-2 custom-scrollbar"
            style={{ overflowAnchor: 'none', display: 'block' }} 
        >
            {/* 복기 시작 배너 */}
            <div className="py-8 flex flex-col items-center gap-2 opacity-40">
                <span className="text-[9px] text-slate-700 font-black tracking-[0.4em] uppercase">
                    ── Start of Match ──
                </span>
            </div>

            {/* 로그 본문 리스트 */}
            <div className="flex flex-col">
                {renderGroupedLogs()}
            </div>

            {/* 하단 감지 영역 */}
            <div 
                ref={bottomObserverRef} 
                className="h-32 w-full flex flex-col items-center justify-center gap-4"
            >
                {isFetchingMore ? (
                    <div className="text-[8px] text-emerald-500/50 animate-pulse font-black uppercase tracking-widest">
                        Fetching Next Records...
                    </div>
                ) : !hasNextPage && logs.length > 0 ? (
                    <div className="py-12 flex flex-col items-center gap-3 opacity-20">
                        <div className="h-px w-20 bg-slate-500" />
                        <span className="text-[8px] font-black uppercase tracking-[0.4em]">End of Record</span>
                    </div>
                ) : null}
            </div>

            {logs.length === 0 && (
                <div className="py-20 text-center text-slate-700 text-[10px] italic font-medium">
                    No timeline logs available for this match.
                </div>
            )}
        </div>
    );
}