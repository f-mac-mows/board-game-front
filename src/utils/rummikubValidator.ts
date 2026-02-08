import { RummikubBoardTile } from "@/types/rummikub";
import { TileColor } from "@/types/rummikub";

const TILE_WIDTH = 50;
const DISTANCE_THRESHOLD = 60; // 인접 타일 판단 기준

export const RummikubValidator = {
  // 물리적 거리 기반 뭉치 분리 (BFS)
  getRowsWithChunks(tiles: RummikubBoardTile[]): RummikubBoardTile[][] {
    if (tiles.length === 0) return [];
    const visited = new Set<number>();
    const allChunks: RummikubBoardTile[][] = [];

    // 1. 타일들을 복사하여 원본 배열 훼손 방지
    const sortedTiles = [...tiles];

    sortedTiles.forEach((startTile) => {
      if (visited.has(startTile.tileId)) return;
      
      const currentChunk: RummikubBoardTile[] = [];
      const queue = [startTile];
      visited.add(startTile.tileId);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        currentChunk.push(curr);

        sortedTiles.forEach((neighbor) => {
          if (!visited.has(neighbor.tileId)) {
            const dx = Math.abs(curr.x - neighbor.x);
            const dy = Math.abs(curr.y - neighbor.y);
            
            // 거리 조건 혹은 setId 조건 (둘 중 하나만 만족해도 연결)
            const isPhysicallyClose = dx < DISTANCE_THRESHOLD && dy < 25;
            const isSameSet = curr.setId !== 0 && curr.setId === neighbor.setId;

            if (isPhysicallyClose || isSameSet) {
              visited.add(neighbor.tileId);
              queue.push(neighbor);
            }
          }
        });
      }
      allChunks.push(currentChunk.sort((a, b) => a.x - b.x));
    });

    // [중요] 혹시라도 누락된 타일이 없는지 검증하는 로직 (사라짐 방지)
    const processedCount = allChunks.reduce((acc, chunk) => acc + chunk.length, 0);
    if (processedCount !== tiles.length) {
      console.warn("일부 타일이 뭉치 계산에서 누락되었습니다.");
    }

    return allChunks;
  },

  validateBoard(boardTiles: RummikubBoardTile[]): { isValid: boolean; invalidTileIds: number[]; totalScore: number } {
    const invalidTileIds: number[] = [];
    const chunks = this.getRowsWithChunks(boardTiles);
    let totalScore = 0;

    chunks.forEach((chunk) => {
      const isValid = this.isValidSet(chunk);
      if (!isValid) {
        chunk.forEach((t) => invalidTileIds.push(t.tileId));
      } else {
        totalScore += this.calculateChunkScore(chunk);
      }
    });

    return {
      isValid: invalidTileIds.length === 0 && boardTiles.length > 0,
      invalidTileIds,
      totalScore
    };
  },

  isValidSet(chunk: RummikubBoardTile[]): boolean {
    if (chunk.length < 3) return false;
    const parsed = chunk.map(t => this.parseTileValue(t.tileValue));
    const jokers = parsed.filter(t => t.number === 0);
    const normals = parsed.filter(t => t.number !== 0);
    return this.isGroup(normals, jokers.length) || this.isRun(normals, jokers.length);
  },

  isGroup(normals: any[], jokerCount: number): boolean {
    if (normals.length + jokerCount > 4 || normals.length === 0) return false;
    return normals.every(t => t.number === normals[0].number) && new Set(normals.map(t => t.color)).size === normals.length;
  },

  isRun(normals: any[], jokerCount: number): boolean {
    const isSameColor = new Set(normals.map(t => t.color)).size === 1;
    if (!isSameColor) return false;
    const sorted = [...normals].sort((a, b) => a.number - b.number);
    let neededJokers = 0;
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i].number - sorted[i - 1].number - 1;
      if (gap < 0) return false;
      neededJokers += gap;
    }
    return neededJokers <= jokerCount && (normals.length + jokerCount <= 13);
  },

  calculateChunkScore(chunk: RummikubBoardTile[]): number {
    const parsed = chunk.map(t => this.parseTileValue(t.tileValue));
    const firstNormalIdx = parsed.findIndex(t => t.number !== 0);
    if (firstNormalIdx === -1) return 0;
    
    // Group 판정
    if (this.isGroup(parsed.filter(t => t.number !== 0), parsed.filter(t => t.number === 0).length)) {
      return parsed[firstNormalIdx].number * chunk.length;
    }
    // Run 판정
    const startNum = parsed[firstNormalIdx].number - firstNormalIdx;
    return (chunk.length * (2 * startNum + chunk.length - 1)) / 2;
  },

  parseTileValue(tileValue: string): { color: TileColor; number: number } {
    if (!tileValue || tileValue === "JOKER") {
      return { color: "JOKER", number: 0 };
    }
    const [colorStr, numStr] = tileValue.split("_");
    
    // colorStr을 TileColor 타입으로 강제 형변환하여 반환
    return { 
      color: colorStr as TileColor, 
      number: parseInt(numStr, 10) 
    };
  }
};