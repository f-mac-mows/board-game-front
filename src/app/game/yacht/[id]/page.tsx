"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { yachtApi } from "@/api/yacht";
import { useUserStore } from "@/store/useUserStore";
import { 
    YachtGameEvent, 
    ScoreCard, 
    ScoreCategory, 
    CategoryLabel, 
    DiceStatus 
} from "@/types/game";
import { CompatClient, Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import Dice from "@/components/game/Dice";

export default function YachtGamePage() {
    const { id } = useParams();
    const gameId = Number(id);
    const router = useRouter();
    const { user } = useUserStore();

    // --- 게임 상태 관리 ---
    const [dice, setDice] = useState<number[]>([1, 1, 1, 1, 1]);
    const [keepIndices, setKeepIndices] = useState<number[]>([]);
    const [remainingRolls, setRemainingRolls] = useState(3);
    const [currentTurn, setCurrentTurn] = useState("");
    const [scoreCards, setScoreCards] = useState<ScoreCard[]>([]);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winnerData, setWinnerData] = useState<any>(null);
    const [timer, setTimer] = useState(30);

    // 주사위 애니메이션
    const [isRolling, setIsRolling] = useState(false);

    // --- 소켓 연결 ---
    useEffect(() => {
        const socket = new SockJS(`http://walrung.ddns.net:8080/ws-game`);
        const client = Stomp.over(socket);

        client.connect({}, () => {
            // 게임 이벤트 구독
            client.subscribe(`/topic/game/${gameId}`, (message) => {
                const event: YachtGameEvent = JSON.parse(message.body);
                handleGameEvent(event);
            });

            // 초기 상태 동기화
            syncGameStatus();
        });

        return () => { if (client.connected) client.disconnect(); };
    }, [gameId]);

    // --- 이벤트 핸들러 ---
    const handleGameEvent = useCallback((event: YachtGameEvent) => {
        switch (event.type) {
            case 'DICE_ROLLED':
                setIsRolling(true); // 애니메이션 시작
                setTimeout(() => {
                    setDice(event.data.diceValues);
                    setRemainingRolls(event.data.remainingRolls);
                    setCurrentTurn(event.data.turnNickname);
                    setIsRolling(false); // 결과 표시
                }, 600);
                break;

            case 'SCORE_RECORDED':
                setScoreCards(event.data);
                resetTurnState(event.nextTurn);
                break;

            case 'TURN_CHANGED':
                // 타임아웃 등으로 인한 강제 턴 전환
                alert(event.data);
                resetTurnState(event.nextTurn);
                break;

            case 'GAME_OVER':
                setIsGameOver(true);
                setWinnerData(event.data);
                break;
        }
    }, []);

    const syncGameStatus = async () => {
        const res = await yachtApi.syncGame(gameId);
        // 서버 Map 구조에 맞춰 상태 설정
        if (res.data.lastDice) setDice(res.data.lastDice.split(',').map(Number));
        if (res.data.remaining) setRemainingRolls(Number(res.data.remaining));
        if (res.data.turn) setCurrentTurn(res.data.turn);
        // 점수판은 별도 조회 API가 필요할 수 있으나, 보통 sync 시 함께 내려주도록 구성 권장
    };

    const resetTurnState = (nextTurn?: string) => {
        setCurrentTurn(nextTurn || "");
        setRemainingRolls(3);
        setKeepIndices([]);
        setDice([1, 1, 1, 1, 1]);
        setTimer(30);
    };

    // --- 액션 함수 ---
    const handleRollDice = async () => {
        if (currentTurn !== user?.nickname || remainingRolls <= 0) return;

        setIsRolling(true);

        try {
            await yachtApi.rollDice(gameId, keepIndices);
            setTimeout(() => {
                setIsRolling(false);
            }, 800);
        } catch (err: any) {
            setIsRolling(false);
            alert(err.response?.data?.message || "굴리기 실패");
        }
    };

    const handleRecordScore = async (category: ScoreCategory) => {
        if (currentTurn !== user?.nickname) return;
        try {
            await yachtApi.recordScore(gameId, category);
        } catch (err: any) {
            alert(err.response?.data?.message || "기록 실패");
        }
    };

    const isMyTurn = currentTurn === user?.nickname;

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
            {/* 좌측: 주사위 및 컨트롤러 */}
            <div className="flex-[2] flex flex-col gap-6">
                <header className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex justify-between items-center shadow-2xl">
                    <div>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Current Turn</p>
                        <h2 className={`text-2xl font-black ${isMyTurn ? 'text-blue-500' : 'text-white'}`}>
                            {isMyTurn ? "YOUR TURN" : `${currentTurn}'s Turn`}
                        </h2>
                    </div>
                    <div className="flex gap-8">
                        <div className="text-center">
                            <p className="text-slate-500 text-xs font-bold uppercase">Time</p>
                            <p className={`text-2xl font-mono font-bold ${timer < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                00:{timer < 10 ? `0${timer}` : timer}
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
                                onClick={() => isMyTurn && !isRolling && setKeepIndices(prev => 
                                    prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
                                )}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleRollDice}
                        disabled={!isMyTurn || remainingRolls === 0}
                        className="group relative px-16 py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl font-black text-2xl transition-all shadow-xl disabled:shadow-none overflow-hidden"
                    >
                        <span className="relative z-10">ROLL DICE</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                    </button>
                </main>
            </div>

            {/* 우측: 점수판 */}
            <aside className="flex-1 bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                <h3 className="text-xl font-black mb-6 italic text-blue-500 flex justify-between items-center">
                    SCOREBOARD
                    <span className="text-[10px] text-slate-500 not-italic font-normal">Click a cell to record</span>
                </h3>
                
                <div className="space-y-1">
                    <div className="grid grid-cols-3 gap-2 text-[10px] font-bold text-slate-500 mb-4 px-2">
                        <span>CATEGORY</span>
                        <span className="text-center">YOU</span>
                        <span className="text-center">OPPONENT</span>
                    </div>

                    {(Object.keys(CategoryLabel) as ScoreCategory[]).map((cat) => {
                        const myCard = scoreCards.find(c => c.nickname === user?.nickname);
                        const opponentCard = scoreCards.find(c => c.nickname !== user?.nickname);
                        const field = cat.toLowerCase().replace(/_([a-z])/g, (g) => g[1].toUpperCase()) as keyof ScoreCard;
                        
                        const myScore = myCard?.[field];
                        const opScore = opponentCard?.[field];
                        const isFilled = myScore !== null && myScore !== undefined;

                        return (
                            <div key={cat} className="grid grid-cols-3 gap-2 py-1 items-center">
                                <span className="text-xs text-slate-400 font-medium pl-2">{CategoryLabel[cat]}</span>
                                <button
                                    disabled={!isMyTurn || isFilled || remainingRolls === 3}
                                    onClick={() => handleRecordScore(cat)}
                                    className={`py-2 rounded-xl text-sm font-mono font-bold transition-all border
                                        ${isFilled 
                                            ? 'bg-slate-950 border-transparent text-white' 
                                            : isMyTurn && remainingRolls < 3
                                                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20' 
                                                : 'bg-slate-950 border-slate-800 text-slate-700'}`}
                                >
                                    {isFilled ? myScore : (isMyTurn && remainingRolls < 3 ? '?' : '')}
                                </button>
                                <div className="py-2 rounded-xl text-sm font-mono font-bold text-center bg-slate-950/30 text-slate-500 border border-transparent">
                                    {opScore ?? ''}
                                </div>
                            </div>
                        );
                    })}

                    {/* 총점 섹션 */}
                    <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                        <div className="flex justify-between px-2 text-sm font-bold">
                            <span className="text-blue-500">TOTAL</span>
                            <span className="text-blue-500 font-mono">
                                {scoreCards.find(c => c.nickname === user?.nickname)?.totalScore || 0}
                            </span>
                            <span className="text-slate-500 font-mono">
                                {scoreCards.find(c => c.nickname !== user?.nickname)?.totalScore || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* 종료 모달 (Portal 생략, 간단 구현) */}
            {isGameOver && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-800 p-12 rounded-[40px] text-center max-w-md w-full shadow-[0_0_100px_rgba(37,99,235,0.2)]">
                        <h2 className="text-5xl font-black italic text-blue-500 mb-2">GAME OVER</h2>
                        <p className="text-slate-400 mb-8">Final Results are in</p>
                        
                        <div className="text-3xl font-black text-white mb-12">
                            {winnerData?.isDraw ? "IT'S A DRAW!" : `${winnerData?.winnerNickname} WINS!`}
                        </div>

                        <button 
                            onClick={() => router.push('/rooms')}
                            className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-slate-200 transition-all"
                        >
                            BACK TO LOBBY
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}