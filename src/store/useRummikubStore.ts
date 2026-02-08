import { create } from 'zustand';
import { RummikubBoardTile, RummikubTile, TileColor } from '@/types/rummikub';
import { RummikubValidator } from '@/utils/rummikubValidator';
import { RummikubSorter } from '@/utils/rummikubSorter';

const TILE_WIDTH = 50;
const TILE_HEIGHT = 70; // 타일 높이 정의
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
  setBoardTiles: (tiles: RummikubBoardTile[]) => void;
  initializeGame: (data: { table: RummikubBoardTile[]; myHand: RummikubTile[] }) => void;
  moveTile: (tileId: number, to: 'board' | 'hand', x: number, y: number) => void;
  remoteMoveTile: (tileId: number, x: number, y: number) => void;
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

  setBoardTiles: (tiles) => {
    const { myNickname, currentTurnNickname } = get();
    if (myNickname === currentTurnNickname) return;
    set({ boardTiles: tiles });
    get().validateCurrentBoard();
  },

  initializeGame: ({ table, myHand }) => {
    if (get().boardTiles.length > 0 || get().handTiles.length > 0) return;
    const positionedHand = RummikubSorter.sortByColor(myHand).map((t) => {
      const parsed = RummikubValidator.parseTileValue(t.tileValue);
      return { id: t.tileId, color: parsed.color as TileColor, number: parsed.number, x: t.x, y: t.y } as HandTile;
    });
    set({ boardTiles: table, handTiles: positionedHand, invalidTileIds: [] });
    get().validateCurrentBoard();
  },

  remoteMoveTile: (tileId, x, y) => set((state) => ({
    boardTiles: state.boardTiles.map(t => t.tileId === tileId ? { ...t, x, y } : t)
  })),

  moveTile: (tileId, to, x, y) => set((state) => {
    // 1. 공통 경계 제한 (Board & Hand 영역 공통)
    let finalX = Math.max(PADDING, Math.min(x, BOARD_WIDTH - TILE_WIDTH - PADDING));
    let finalY = y;

    const movingTile = state.boardTiles.find(t => t.tileId === tileId) || 
                       state.handTiles.find(t => t.id === tileId);
    
    if (!movingTile) return state;

    const isFromBoard = 'tileId' in movingTile;
    let nextBoard = [...state.boardTiles.filter(t => t.tileId !== tileId)];
    let nextHand = [...state.handTiles.filter(t => t.id !== tileId)];

    /**
     * 🚩 범용 충돌 해결 함수 (Board/Hand 모두 사용 가능)
     */
    const resolveCollision = (targetX: number, targetY: number, tiles: any[], idKey: string): number => {
      const gap = 5;
      const overlapIdx = tiles.findIndex(t => 
        t[idKey] !== tileId && // 자기 자신 제외
        Math.abs(t.y - targetY) < 30 && 
        targetX < t.x + TILE_WIDTH && 
        targetX + TILE_WIDTH > t.x
      );

      if (overlapIdx !== -1) {
        const overlappedTile = tiles[overlapIdx];
        let nextPushX = overlappedTile.x + TILE_WIDTH + gap;

        // 보드/손패 오른쪽 끝을 벗어나면 밀어내기 중단 (이전 위치 리턴)
        if (nextPushX + TILE_WIDTH > BOARD_WIDTH - PADDING) {
          return targetX - (TILE_WIDTH + gap);
        }

        tiles[overlapIdx] = { 
          ...overlappedTile, 
          x: resolveCollision(nextPushX, targetY, tiles, idKey) 
        };
      }
      return targetX;
    };

    if (to === 'board') {
      // 보드 영역 자석 효과
      let targetSetId = Math.floor(Math.random() * 1000000);
      for (const target of nextBoard) {
        if (Math.abs(target.y - finalY) < 30 && Math.abs(target.x - finalX) < TILE_WIDTH + 20) {
          finalY = target.y;
          const magnetX = target.x + (finalX > target.x ? TILE_WIDTH + 5 : -(TILE_WIDTH + 5));
          finalX = Math.max(PADDING, Math.min(magnetX, BOARD_WIDTH - TILE_WIDTH - PADDING));
          targetSetId = target.setId;
          break;
        }
      }

      // 보드 충돌 해결
      finalX = resolveCollision(finalX, finalY, nextBoard, 'tileId');

      const updatedTile: RummikubBoardTile = {
        tileId: isFromBoard ? movingTile.tileId : (movingTile as any).id,
        tileValue: 'tileValue' in movingTile ? movingTile.tileValue : `${(movingTile as any).color}_${(movingTile as any).number}`,
        x: finalX,
        y: finalY,
        setId: targetSetId
      };

      setTimeout(() => get().validateCurrentBoard(), 0);
      return { boardTiles: [...nextBoard, updatedTile], handTiles: nextHand };

    } else {
      // --- 🚩 손패 영역 로직 ---
      const parsed = 'tileValue' in movingTile ? RummikubValidator.parseTileValue(movingTile.tileValue) : movingTile;
      
      // 손패에서도 밀어내기 적용
      finalX = resolveCollision(finalX, finalY, nextHand, 'id');

      const newHandTile: HandTile = {
        id: 'id' in movingTile ? (movingTile as any).id : (movingTile as any).tileId,
        color: (parsed as any).color,
        number: (parsed as any).number,
        x: finalX,
        y: finalY
      };

      return { boardTiles: nextBoard, handTiles: [...nextHand, newHandTile] };
    }
  }),

  sortHand: (type) => {
    const { handTiles } = get();
    const rawTiles: RummikubTile[] = handTiles.map(({ x, y, ...rest }) => ({
      ...rest,
      tileId: rest.id,
      tileValue: `${rest.color}_${rest.number}`
    }));
    
    const sorted = type === 'color' ? RummikubSorter.sortByColor(rawTiles) : RummikubSorter.sortByNumber(rawTiles);
    set({ handTiles: sorted.map(t => {
      const p = RummikubValidator.parseTileValue(t.tileValue);
      return { id: t.tileId, color: p.color as TileColor, number: p.number, x: t.x, y: t.y };
    })});
  },

  validateCurrentBoard: () => {
    const { boardTiles } = get();
    const result = RummikubValidator.validateBoard(boardTiles);
    set({ isBoardValid: result.isValid, invalidTileIds: result.invalidTileIds, currentBoardScore: result.totalScore });
  },

  moveGroup: (setId, deltaX, deltaY) => set((state) => {
    const updatedBoard = state.boardTiles.map(t => t.setId === setId ? { ...t, x: t.x + deltaX, y: t.y + deltaY } : t);
    setTimeout(() => get().validateCurrentBoard(), 0);
    return { boardTiles: updatedBoard };
  }),
}));