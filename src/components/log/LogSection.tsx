import { useEffect, useRef, useState } from 'react';
import { useLogs } from '@/hooks/useLogs';
import { MatchLogRenderer } from './MatchLogRenderer';
import { GameTypeCode } from '@/types/rooms';
import { YachtLog } from '@/types/log';

interface LogSectionProps {
    gameId: number;
    gameType: GameTypeCode | null;
    nickname: string;
}

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
    const topObserverRef = useRef<HTMLDivElement>(null);
    const [isInitialScrolled, setIsInitialScrolled] = useState(false);

    // 1. 인피니티 스크롤 (상단 감지)
    useEffect(() => {
        if (!topObserverRef.current || !hasNextPage) return;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isFetchingMore) {
                    fetchMore();
                }
            },
            { threshold: 0.1 }
        );
        observer.observe(topObserverRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingMore, fetchMore]);

    // 2. 초기 로드 시 하단으로 스크롤 고정
    useEffect(() => {
        if (logs.length > 0 && !isInitialScrolled && !isFetchingMore) {
            if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
                setIsInitialScrolled(true);
            }
        }
    }, [logs, isInitialScrolled, isFetchingMore]);

    const renderGroupedLogs = () => {
        const elements: React.ReactNode[] = [];
        let keepGroup: YachtLog[] = [];

        logs.forEach((log, idx) => {
            if (log.action === 'KEEP') {
                keepGroup.push(log as YachtLog);
            } else {
                if (keepGroup.length > 0) {
                    elements.push(
                        <MatchLogRenderer 
                            key={`group-${keepGroup[0].id}`} 
                            log={keepGroup[0]} 
                            isGroupedKeep={true} 
                            groupItems={[...keepGroup]} 
                            isMe={keepGroup[0].nickname === nickname}
                        />
                    );
                    keepGroup = [];
                }
                elements.push(
                    <MatchLogRenderer 
                        key={log.id} 
                        log={log} 
                        isMe={log.nickname === nickname} 
                    />
                );
            }
        });

        if (keepGroup.length > 0) {
            elements.push(
                <MatchLogRenderer 
                    key="group-last" 
                    log={keepGroup[0]} 
                    isGroupedKeep={true} 
                    groupItems={keepGroup} 
                    isMe={keepGroup[0].nickname === nickname}
                />
            );
        }
        return elements;
    };

    if (isLoading) return <div className="py-20 text-center animate-pulse text-slate-500 text-[10px] font-black uppercase">Decrypting Match History...</div>;
    if (isError) return <div className="py-20 text-center text-rose-500 text-[10px] font-black uppercase">Failed to retrieve records.</div>;

    return (
        <div 
            ref={scrollContainerRef}
            className="relative space-y-1 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
            style={{ overflowAnchor: 'none' }}
        >
            <div ref={topObserverRef} className="h-1 w-full" />
            {isFetchingMore && (
                <div className="py-2 text-center text-[9px] text-emerald-500/50 animate-pulse font-bold uppercase">
                    Retrieving older logs...
                </div>
            )}
            {renderGroupedLogs()}
            {logs.length === 0 && (
                <div className="py-20 text-center text-slate-600 text-[10px] italic font-medium">
                    No timeline data found.
                </div>
            )}
        </div>
    );
}