"use client";

import { useEffect, useState, useMemo } from "react";
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useRummikubStore } from "@/store/useRummikubStore";
import { RummikubValidator } from "@/utils/rummikubValidator";
import { toast } from "react-hot-toast";
import RummikubCell from "./RummikubCell";
import RummikubTile from "./RummikubTile";
import { useRouter } from "next/navigation";
import { rummikubApi } from "@/api/rummikub";
import { useRummikubActions } from "@/hooks/useRummikub";

export default function RummikubGame({ roomId }: { roomId: string }) {
  const { 
    boardTiles, handTiles, moveTile, sortHand, initializeGame,
    myNickname, currentTurnNickname, isBoardValid, setBoardValid,
    setMyNickname, setCurrentTurn 
  } = useRummikubStore();

  const [isGameOver, setIsGameOver] = useState(false);
  const [winnerData, setWinnerData] = useState<any>(null);
  const [invalidIds, setInvalidIds] = useState<string[]>([]);
  const isMyTurn = useMemo(() => currentTurnNickname === myNickname, [currentTurnNickname, myNickname]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const router = useRouter();

  const { submitTurn } = useRummikubActions(Number(roomId));
  
  // 초기 동기화
  useEffect(() => {
  rummikubApi.sync(Number(roomId))
    .then(res => {
      const data = res.data; // Axios는 res.data에 데이터가 들어있습니다.
      setMyNickname(data.myNickname);
      setCurrentTurn(data.currentTurn);
      initializeGame({ table: data.table, myHand: data.myHand });
    })
    .catch(err => toast.error("게임 데이터를 가져오지 못했습니다."));
}, [roomId]);

  // 실시간 유효성 검사
  useEffect(() => {
    const { isValid, invalidTileIds } = RummikubValidator.validateBoard(boardTiles);
    setInvalidIds(invalidTileIds);
    setBoardValid(isValid);
  }, [boardTiles]);

  const handleDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;

    const [area, x, y] = (over.id as string).split("-");
    const toX = Number(x), toY = Number(y);
    const tileId = Number(active.id);

    // 1. UI 즉시 반영 (Optimistic Update)
    moveTile(active.id.toString(), area as any, toX, toY);

    // 2. 서버 동기화 (Axios 사용)
    if (area === "board") {
      try {
          await rummikubApi.move(Number(roomId), { tileId, toX, toY });
      } catch (error) {
          console.error("Move sync failed:", error);
          // 필요 시 moveTile을 이전 상태로 되돌리는 로직 추가
      }
    }
  };

  const handleSubmit = () => {
    if (!isBoardValid) return toast.error("조합이 올바르지 않습니다.");
    
    submitTurn({
      nickname: myNickname,
      newTable: RummikubValidator.getRowsWithChunks(boardTiles),
      newHand: handTiles
    });
  };

  const renderGrid = (area: "board" | "hand", rows: number, cols: number) => {
    return Array.from({ length: rows * cols }).map((_, i) => {
      const r = Math.floor(i / cols), c = i % cols;
      const cellId = `${area}-${r}-${c}`;
      const tile = (area === "board" ? boardTiles : handTiles).find(t => t.x === r && t.y === c);
      return (
        <RummikubCell key={cellId} id={cellId}>
          {tile && <RummikubTile tile={tile} isError={invalidIds.includes(tile.id.toString())} />}
        </RummikubCell>
      );
    });
  };
  
  const handleReturnToLobby = () => {
    // 유저를 대기방(Room)으로 다시 보냄
    // 만약 방 번호(roomId)가 없다면 기본 룸 리스트로 이동
    if (roomId) {
        router.push(`/rooms/${roomId}`);
    } else {
        router.push('/rooms');
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-4 p-4 max-w-7xl mx-auto">
        <div className={`text-center p-2 rounded-xl font-bold ${isMyTurn ? 'bg-blue-600' : 'bg-slate-700'}`}>
          {isMyTurn ? "Your Turn" : `${currentTurnNickname}'s Turn`}
        </div>
        <div className={`grid grid-cols-20 gap-1 bg-slate-800 p-2 rounded-lg ${!isMyTurn && 'opacity-50 pointer-events-none'}`}>
          {renderGrid("board", 8, 20)}
        </div>
        <div className="flex justify-between bg-slate-900 p-4 rounded-lg">
          <div className="flex gap-2">
            <button onClick={() => sortHand('color')} className="px-3 py-1 bg-slate-700 rounded">Color</button>
            <button onClick={() => sortHand('number')} className="px-3 py-1 bg-slate-700 rounded">Num</button>
          </div>
          <button onClick={handleSubmit} disabled={!isMyTurn || !isBoardValid} className="px-6 py-1 bg-blue-600 disabled:bg-slate-600 rounded">SUBMIT</button>
        </div>
        <div className="grid grid-cols-20 gap-1 bg-slate-800/50 p-2 rounded-lg">
          {renderGrid("hand", 2, 20)}
        </div>

        {/* 게임 종료 모달: 결과 표시 및 로비 복귀 */}
        {isGameOver && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-100 p-4 animate-in fade-in duration-500">
                <div className="bg-slate-900 border border-slate-800 p-10 rounded-[40px] text-center max-w-md w-full shadow-[0_0_100px_rgba(59,130,246,0.15)]">
                    <h2 className="text-4xl font-black italic text-blue-500 mb-2 uppercase tracking-tighter">Game Set</h2>
                    <p className="text-slate-500 mb-8 uppercase tracking-[0.2em] text-[10px] font-bold">Rummikub Results</p>
                    
                    {/* 승리자 표시 */}
                    <div className="text-3xl font-black text-white mb-2">
                        {winnerData?.winnerNickname === myNickname ? "🏆 VICTORY!" : "GG! WELL PLAYED"}
                    </div>
                    <p className="text-slate-400 text-sm mb-8">
                        Winner: <span className="text-blue-400 font-bold">{winnerData?.winnerNickname}</span>
                    </p>

                    {/* RP 변동 (간결하게) */}
                    <div className="flex justify-center mb-12">
                        <div className={`
                            flex items-center gap-2 px-6 py-2 rounded-full font-black text-sm border
                            ${winnerData?.winnerNickname === myNickname 
                                ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' 
                                : 'bg-red-500/10 border-red-500/50 text-red-400'}
                        `}>
                            <span>RP</span>
                            <span>{winnerData?.winnerNickname === myNickname ? "▲ UP" : "▼ DOWN"}</span>
                        </div>
                    </div>

                    {/* 복귀 버튼: 강한 대기방 정책에 따라 지정된 핸들러 호출 */}
                    <button 
                        onClick={handleReturnToLobby}
                        className="w-full py-4 bg-white text-black rounded-2xl font-bold hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 shadow-lg"
                    >
                        RETURN TO LOBBY
                    </button>
                </div>
            </div>
        )}
      </div>
    </DndContext>
  );
}