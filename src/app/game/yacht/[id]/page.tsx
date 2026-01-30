"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { yachtApi } from "@/api/yacht";
import { useUserStore } from "@/store/useUserStore";
import { YachtCalculator } from "@/utils/yatchCalculator";
import { 
    YachtGameEvent, 
    ScoreCard, 
    ScoreCategory, 
    CategoryLabel, 
    GameResult
} from "@/types/game";
import { Stomp, CompatClient } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Dice from "@/components/game/Dice";
import { roomApi } from "@/api/rooms";

export default function YachtGamePage() {
    const { id } = useParams();
    const gameId = Number(id);
    const router = useRouter();
    const { user } = useUserStore();
    const stompClient = useRef<CompatClient | null>(null);

    const [originalRoomId, setOriginalRoomId] = useState<number | null>(null);

    // --- 게임 상태 관리 ---
    const [dice, setDice] = useState<number[]>([1, 1, 1, 1, 1]);
    const [keepIndices, setKeepIndices] = useState<number[]>([]);
    const [remainingRolls, setRemainingRolls] = useState(3);
    const [currentTurn, setCurrentTurn] = useState("");
    const [scoreCards, setScoreCards] = useState<ScoreCard[]>([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winnerData, setWinnerData] = useState<GameResult | null>(null);
    const [timer, setTimer] = useState(45);
    const [isRolling, setIsRolling] = useState(false);

    // --- 소켓 연결 ---
    useEffect(() => {
        syncGameStatus();

        const socket = new SockJS(`http://walrung.ddns.net:8080/ws-game`);
        const client = Stomp.over(socket);
        stompClient.current = client;

        client.connect({}, () => {
            client.subscribe(`/topic/game/${gameId}`, (message) => {
                const event: YachtGameEvent = JSON.parse(message.body);
                handleGameEvent(event);
            });
            
            syncGameStatus();
        });

        return () => {
            if (stompClient.current) stompClient.current.deactivate();
        };
    }, [gameId]);

    // --- 이벤트 핸들러 ---
    const handleGameEvent = (event: YachtGameEvent) => {
            if (event.remainingSeconds !== undefined) {
            setTimer(event.remainingSeconds);
        }
        switch (event.type) {
            case 'KEEP_UPDATED':
                // 상대방이 보낸 Keep 상태를 내 화면에 반영
                // (내가 보낸 이벤트가 다시 올 수도 있으므로 sender 체크 가능)
                if (event.sender !== user?.nickname) {
                    setKeepIndices(event.keepIndices);
                }
                break;

            case 'DICE_ROLLED':
                setIsRolling(true);
                setTimeout(() => {
                    setDice(event.data.diceValues);
                    setRemainingRolls(event.data.remainingRolls);
                    setCurrentTurn(event.data.turnNickname);
                    setIsRolling(false);
                }, 600);
                break;

            case 'SCORE_RECORDED':
                setScoreCards(event.data);
                resetTurnState(event.nextTurn);
                break;

            case 'TURN_CHANGED':
                syncGameStatus();
                resetTurnState(event.nextTurn);
                break;

            case 'GAME_OVER':
                setWinnerData(event.data);
                setIsGameOver(true);
                if (event.roomId) setOriginalRoomId(event.roomId);
                break;
        }
    };

    useEffect(() => {
        if (isGameOver) return;

        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 0) return 0; // 0초에서 멈춤 (서버의 TURN_CHANGED 대기)
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isGameOver]);

    const syncGameStatus = async () => {
        try {
            const res = await yachtApi.syncGame(gameId);
            const { status, scoreCards } = res.data;

            // 1. 점수판 즉시 복구
            if (scoreCards) {
                setScoreCards(scoreCards);
            }

            // 2. 게임 상태 복구
            if (status) {
                if (status.timerSeconds) setTimer(Number(status.timerSeconds));
                if (status.lastDice) setDice(status.lastDice.split(',').map(Number));
                if (status.remaining) setRemainingRolls(Number(status.remaining));
                if (status.turn) setCurrentTurn(status.turn);
            }
        } catch (err) {
            console.error("동기화 실패:", err);
        }
    };

    const resetTurnState = (nextTurn?: string) => {
        setCurrentTurn(nextTurn || "");
        setRemainingRolls(3);
        setKeepIndices([]);
        setDice([1, 1, 1, 1, 1]);
        setTimer(45);
    };

    // --- 액션 함수 ---
    const handleRollDice = async () => {
        if (currentTurn !== user?.nickname || remainingRolls <= 0 || isRolling) return;
        try {
            await yachtApi.rollDice(gameId, keepIndices);
        } catch (err: any) {
            alert(err.response?.data?.message || "굴리기 실패");
        }
    };

    const handleRecordScore = async (category: ScoreCategory) => {
        if (currentTurn !== user?.nickname || isRolling) return;
        try {
            await yachtApi.recordScore(gameId, category);
        } catch (err: any) {
            alert(err.response?.data?.message || "기록 실패");
        }
    };

    const isMyTurn = currentTurn === user?.nickname;

    // --- 점수 미리보기 계산 ---
    const expectedScores = isMyTurn && remainingRolls < 3 && !isRolling
        ? {
            ONES: YachtCalculator.calculateSubTotal(dice, 1),
            TWOS: YachtCalculator.calculateSubTotal(dice, 2),
            THREES: YachtCalculator.calculateSubTotal(dice, 3),
            FOURS: YachtCalculator.calculateSubTotal(dice, 4),
            FIVES: YachtCalculator.calculateSubTotal(dice, 5),
            SIXES: YachtCalculator.calculateSubTotal(dice, 6),
            CHOICE: YachtCalculator.calculateSum(dice),
            FOUR_OF_A_KIND: YachtCalculator.calculateFourOfAKind(dice),
            FULL_HOUSE: YachtCalculator.calculateFullHouse(dice),
            SMALL_STRAIGHT: YachtCalculator.calculateSmallStraight(dice),
            LARGE_STRAIGHT: YachtCalculator.calculateLargeStraight(dice),
            YACHT: YachtCalculator.calculateYacht(dice),
        }
        : null;

    // --- 보너스 계산 로직 추가 ---
    const getBonusProgress = () => {
        const myCard = scoreCards.find(c => c.nickname === user?.nickname);
        if (!myCard) return { sum: 0, remaining: 63, hasBonus: false };

        // Upper Categories: Ones ~ Sixes
        const upperSum = (myCard.ones || 0) + (myCard.twos || 0) + (myCard.threes || 0) + 
                         (myCard.fours || 0) + (myCard.fives || 0) + (myCard.sixes || 0);
        
        return {
            sum: upperSum,
            remaining: Math.max(0, 63 - upperSum),
            hasBonus: upperSum >= 63
        };
    };

    const handleToggleKeep = async (idx: number) => {
        // 제어: 내 턴이 아니거나, 이미 3번 다 굴렸거나, 굴리는 중이면 클릭 무시
        if (!isMyTurn || remainingRolls === 3 || remainingRolls === 0 || isRolling) return;

        // 1. 로컬 상태 즉시 업데이트 (사용자 경험을 위해)
        const newIndices = keepIndices.includes(idx)
            ? keepIndices.filter(i => i !== idx)
            : [...keepIndices, idx];
        
        setKeepIndices(newIndices);

        // 2. 서버에 Keep 상태 전송 (상대방에게 브로드캐스트 요청)
        try {
            await yachtApi.updateKeep(gameId, newIndices);
        } catch (err) {
            console.error("Keep 전송 실패:", err);
        }
    };

    const myBonus = getBonusProgress();

    const handleReturnToLobby = async () => {
        if (originalRoomId) {
        router.push(`/rooms/${originalRoomId}`);
        } else {
            router.push('/rooms');
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
            {/* 좌측: 게임 플레이 영역 */}
            <div className="flex-[2] flex flex-col gap-6">
                <header className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex justify-between items-center shadow-2xl">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Current Turn</p>
                        <h2 className={`text-2xl font-black ${isMyTurn ? 'text-blue-500' : 'text-white'}`}>
                            {isMyTurn ? "YOUR TURN" : `${currentTurn || 'Waiting...'}'s Turn`}
                        </h2>
                    </div>
                    <div className="flex gap-8">
                        <div className="text-center">
                            <p className="text-slate-500 text-xs font-bold uppercase">Time</p>
                            <p className={`text-2xl font-mono font-bold ${timer < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                {/* timer가 0이고 아직 데이터를 불러오는 중이라면 45으로 표시 */}
                                00:{(timer === 0 && !isGameOver) ? "45" : (timer < 10 ? `0${timer}` : timer)}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-slate-500 text-xs font-bold uppercase">Rolls</p>
                            <p className="text-2xl font-mono font-bold text-green-500">{remainingRolls}/3</p>
                        </div>
                    </div>
                </header>

                <main className="bg-slate-900/40 flex-1 rounded-3xl border-2 border-slate-800 border-dashed flex flex-col items-center justify-center gap-12 p-12">
                    <div className="flex gap-4 lg:gap-6">
                        {dice.map((value, idx) => (
                            <Dice
                                key={idx}
                                value={value}
                                isRolling={isRolling}
                                isKeep={keepIndices.includes(idx)}
                                onClick={() => handleToggleKeep(idx)}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleRollDice}
                        disabled={!isMyTurn || remainingRolls === 0 || isRolling}
                        className="group relative px-16 py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl font-black text-2xl transition-all shadow-xl disabled:shadow-none overflow-hidden"
                    >
                        <span className="relative z-10">{isRolling ? "ROLLING..." : "ROLL DICE"}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </button>
                </main>
            </div>

            {/* 우측: 실시간 점수판 */}
            <aside className="flex-1 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h3 className="text-xl font-black mb-6 italic text-blue-500 flex justify-between items-center">
                    SCOREBOARD
                    <span className="text-[10px] text-slate-500 not-italic font-normal uppercase">Bonus at 63pts</span>
                </h3>
                
                <div className="space-y-1">
                    {/* 카테고리 헤더 */}
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-slate-500 mb-4 px-2">
                        <span>CATEGORY</span>
                        <span className="text-center">{scoreCards.find(c => c.nickname === user?.nickname)?.nickname}</span>
                        <span className="text-center">{scoreCards.find(c => c.nickname !== user?.nickname)?.nickname}</span>
                    </div>

                    {/* 점수 항목들 (Ones ~ Sixes 이후에 보너스 바 삽입) */}
                    {(Object.keys(CategoryLabel) as ScoreCategory[]).map((cat, index) => {
                        const myCard = scoreCards.find(c => c.nickname === user?.nickname);
                        const opponentCard = scoreCards.find(c => c.nickname !== user?.nickname);
                        const field = cat.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase()) as keyof ScoreCard;
                        
                        const myScore = myCard?.[field];
                        const opScore = opponentCard?.[field];
                        const isFilled = myScore !== null && myScore !== undefined;
                        const previewScore = expectedScores ? (expectedScores as any)[cat] : 0;

                        const row = (
                            <div key={cat} className="grid grid-cols-3 gap-2 py-1 items-center group">
                                <span className="text-xs text-slate-400 font-medium pl-2">{CategoryLabel[cat]}</span>
                                
                                <button
                                    disabled={!isMyTurn || isFilled || remainingRolls === 3 || isRolling}
                                    onClick={() => handleRecordScore(cat)}
                                    className={`
                                        h-9 flex items-center justify-center rounded-xl text-sm font-mono font-bold transition-all border
                                        
                                        ${isFilled 
                                            ? 'bg-slate-950 border-transparent text-white' 
                                            : isMyTurn && remainingRolls < 3 
                                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white hover:border-blue-400 cursor-pointer shadow-lg shadow-blue-500/20' 
                                                : 'bg-slate-950 border-slate-800 text-slate-700'
                                        }
                                        
                                        ${(!isFilled && isMyTurn && remainingRolls < 3 && !isRolling) ? 'hover:scale-[1.02] active:scale-95' : ''}
                                    `}
                                >
                                    {isFilled ? myScore : (isMyTurn && remainingRolls < 3 ? previewScore : '')}
                                </button>

                                <div className="h-9 flex items-center justify-center rounded-xl text-sm font-mono font-bold bg-slate-950/30 text-slate-500 border border-transparent">
                                    {opScore ?? ''}
                                </div>
                            </div>
                        );

                        // SIXES(index 5) 다음에 보너스 현황판 삽입
                        if (index === 5) {
                            return (
                                <div key="bonus-section">
                                    {row}
                                    <div className="my-4 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                                        <div className="flex justify-between text-[10px] font-black mb-2">
                                            <span className={myBonus.hasBonus ? "text-green-500" : "text-slate-500"}>
                                                UPPER BONUS (+35)
                                            </span>
                                            <span className="text-white">{myBonus.sum} / 63</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-500 ${myBonus.hasBonus ? 'bg-green-500' : 'bg-blue-600'}`}
                                                style={{ width: `${Math.min(100, (myBonus.sum / 63) * 100)}%` }}
                                            />
                                        </div>
                                        {!myBonus.hasBonus && (
                                            <p className="text-[9px] text-slate-600 mt-2 text-right">
                                                {myBonus.remaining} points left to bonus
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        }
                        return row;
                    })}

                    {/* 총점 섹션 */}
                    <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                        <div className="flex justify-between px-2 text-sm font-bold">
                            <span className="text-blue-500 uppercase italic">Total Score</span>
                            <div className="flex gap-8 font-mono">
                                <span className="text-blue-500 text-xl">
                                    {scoreCards.find(c => c.nickname === user?.nickname)?.totalScore || 0}
                                </span>
                                <span className="text-slate-500 text-xl">
                                    {scoreCards.find(c => c.nickname !== user?.nickname)?.totalScore || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* 종료 모달: 결과 표시 및 대기방 복귀 */}
            {isGameOver && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-500">
                    <div className="bg-slate-900 border border-slate-800 p-12 rounded-[40px] text-center max-w-md w-full shadow-[0_0_100px_rgba(37,99,235,0.2)]">
                        <h2 className="text-5xl font-black italic text-blue-500 mb-2">GAME OVER</h2>
                        <p className="text-slate-400 mb-8 uppercase tracking-widest text-xs">Final Results</p>
                        
                        <div className="text-3xl font-black text-white mb-12">
                            {winnerData?.draw ? "IT'S A DRAW!" : `${winnerData?.winnerNickname} WINS!`}
                        </div>

                        <button 
                            onClick={handleReturnToLobby}
                            className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-blue-500 hover:text-white transition-all transform hover:scale-105"
                        >
                            RETURN TO LOBBY
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}