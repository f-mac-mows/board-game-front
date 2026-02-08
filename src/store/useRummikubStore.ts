import { create } from 'zustand';
import { RummikubBoardTile, RummikubTile, TileColor } from '@/types/rummikub';
import { RummikubValidator } from '@/utils/rummikubValidator';
import { RummikubSorter } from '@/utils/rummikubSorter';

const TILE_WIDTH = 50;
const BOARD_WIDTH = 1200;
const PADDING = 10;

export interface HandTile extends RummikubTile {
  x: number;
  y: number;
}

interface RummikubState {
  boardTiles: RummikubBoardTile[];
  handTiles: HandTile[];
  myNickname: string;
  currentTurnNickname: string;
  isBoardValid: boolean;
  invalidTileIds: number[];
  currentBoardScore: number;

  setMyNickname: (nickname: string) => void;
  setCurrentTurn: (nickname: string) => void;
  setBoardValid: (isValid: boolean) => void;
  setBoardTiles: (tiles: RummikubBoardTile[]) => void; // 🚩 추가: 서버 데이터 강제 동기화용
  initializeGame: (data: { table: RummikubBoardTile[]; myHand: RummikubTile[] }) => void;
  moveTile: (tileId: number, to: 'board' | 'hand', x: number, y: number) => void;
  remoteMoveTile: (tileId: number, x: number, y: number) => void; // 🚩 추가: 타 플레이어 드래그 실시간 반영
  sortHand: (type: 'color' | 'number') => void;
  validateCurrentBoard: () => void;
  moveGroup: (setId: number, deltaX: number, deltaY: number) => void;
}

export const useRummikubStore = create<RummikubState>((set, get) => ({
  boardTiles: [],
  handTiles: [],
  myNickname: '',
  currentTurnNickname: '',
  isBoardValid: true,
  invalidTileIds: [],
  currentBoardScore: 0,

  setMyNickname: (nickname) => set({ myNickname: nickname }),
  setCurrentTurn: (nickname) => set({ currentTurnNickname: nickname }),
  setBoardValid: (isValid) => set({ isBoardValid: isValid }),

  // 🚩 서버에서 내려준 보드 상태로 덮어쓰기 (주로 턴 변경 시 사용)
  setBoardTiles: (tiles) => {
    set({ boardTiles: tiles });
    get().validateCurrentBoard();
  },

  initializeGame: ({ table, myHand }) => {
    const positionedHand = RummikubSorter.sortByColor(myHand).map((t) => {
      const parsed = RummikubValidator.parseTileValue(t.tileValue);
      return {
        id: t.tileId,
        color: parsed.color as TileColor,
        number: parsed.number,
        x: t.x,
        y: t.y,
      } as HandTile;
    });

    set({ 
      boardTiles: table, 
      handTiles: positionedHand,
      invalidTileIds: [] 
    });
    get().validateCurrentBoard();
  },

  // 🚩 타 플레이어의 드래그 위치 실시간 업데이트 (검증/자석 없이 위치만 반영)
  remoteMoveTile: (tileId, x, y) => set((state) => ({
    boardTiles: state.boardTiles.map(t => 
      t.tileId === tileId ? { ...t, x, y } : t
    )
  })),

  moveTile: (tileId, to, x, y) => set((state) => {
    let finalX = Math.max(PADDING, Math.min(x, BOARD_WIDTH - TILE_WIDTH - PADDING));
    let finalY = y;

    const movingTile = state.boardTiles.find(t => t.tileId === tileId) || 
                       state.handTiles.find(t => t.id === tileId);
    
    if (!movingTile) return state;

    const isFromBoard = 'tileId' in movingTile;
    
    let nextBoard = state.boardTiles.filter(t => t.tileId !== tileId);
    let nextHand = state.handTiles.filter(t => t.id !== tileId);

    if (to === 'board') {
      nextBoard = nextBoard.map(t => {
        if (Math.abs(t.y - finalY) < 20 && t.x >= finalX - 10 && t.x < finalX + TILE_WIDTH) {
          return { ...t, x: t.x + TILE_WIDTH + 5 };
        }
        return t;
      });

      // 자석 병합 로직
      let targetSetId = Math.floor(Math.random() * 1000000);
      for (const target of nextBoard) {
        if (Math.abs(target.y - finalY) < 30 && Math.abs(target.x - finalX) < TILE_WIDTH + 20) {
          finalY = target.y;
          finalX = target.x + (finalX > target.x ? TILE_WIDTH : -TILE_WIDTH);
          targetSetId = target.setId;
          break;
        }
      }

      const updatedTile: RummikubBoardTile = {
        tileId: isFromBoard ? movingTile.tileId : movingTile.id,
        tileValue: 'tileValue' in movingTile ? movingTile.tileValue : `${movingTile.color}_${movingTile.number}`,
        x: finalX,
        y: finalY,
        setId: targetSetId // 병합된 setId 적용
      };

      setTimeout(() => get().validateCurrentBoard(), 0);
      return { boardTiles: [...nextBoard, updatedTile], handTiles: nextHand };
    } else {
      let color: TileColor;
      let number: number;

      if ('tileValue' in movingTile) {
        const parsed = RummikubValidator.parseTileValue(movingTile.tileValue);
        color = parsed.color as TileColor;
        number = parsed.number;
      } else {
        color = movingTile.color;
        number = movingTile.number;
      }

      const newHandTile: HandTile = {
        id: 'id' in movingTile ? movingTile.id : movingTile.tileId,
        color,
        number,
        x: finalX,
        y: finalY
      };
      return { boardTiles: nextBoard, handTiles: [...nextHand, newHandTile] };
    }
  }),

  sortHand: (type) => {
    const { handTiles } = get();
    const rawTiles: RummikubTile[] = handTiles.map(({ x, y, ...rest }) => rest);
    
    const sortedWithCoords = type === 'color' 
      ? RummikubSorter.sortByColor(rawTiles) 
      : RummikubSorter.sortByNumber(rawTiles);

    const finalHand: HandTile[] = sortedWithCoords.map((t) => {
      const parsed = RummikubValidator.parseTileValue(t.tileValue);
      return {
        id: t.tileId,
        color: parsed.color as TileColor,
        number: parsed.number,
        x: t.x,
        y: t.y,
      } as HandTile;
    });

    set({ handTiles: finalHand });
  },

  validateCurrentBoard: () => {
    const { boardTiles } = get();
    const result = RummikubValidator.validateBoard(boardTiles);
    set({ 
      isBoardValid: result.isValid, 
      invalidTileIds: result.invalidTileIds,
      currentBoardScore: result.totalScore 
    });
  },

  moveGroup: (setId, deltaX, deltaY) => set((state) => {
    const updatedBoard = state.boardTiles.map(t => {
      if (t.setId === setId) {
        return { ...t, x: t.x + deltaX, y: t.y + deltaY };
      }
      return t;
    });

    setTimeout(() => get().validateCurrentBoard(), 0);
    return { boardTiles: updatedBoard };
  }),
}));