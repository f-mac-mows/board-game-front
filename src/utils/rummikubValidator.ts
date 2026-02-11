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
            
            // 🛠️ [수정] setId 비교 로직: "0"을 기본값으로 취급하고 문자열 비교 수행
            const isPhysicallyClose = dx < DISTANCE_THRESHOLD && dy < 25;
            const isSameSet = curr.setId !== "0" && curr.setId === neighbor.setId;

            if (isPhysicallyClose || isSameSet) {
              visited.add(neighbor.tileId);
              queue.push(neighbor);
            }
          }
        });
      }
      allChunks.push(currentChunk.sort((a, b) => a.x - b.x));
    });

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

    if (normals.length === 0) return jokerCount >= 3;

    const numbers = normals.map(t => t.number);
    if (new Set(numbers).size !== normals.length) return false;

    const sorted = [...numbers].sort((a, b) => a - b);
    let neededJokers = 0;
    
    for (let i = 1; i < sorted.length; i++) {
      neededJokers += (sorted[i] - sorted[i - 1] - 1);
    }

    const totalLength = normals.length + jokerCount;
    if (neededJokers <= jokerCount && totalLength <= 13) {
      return (sorted[sorted.length - 1] - sorted[0] + 1) <= totalLength;
    }

    return false;
  },

  calculateChunkScore(chunk: RummikubBoardTile[]): number {
    const parsed = chunk.map(t => this.parseTileValue(t.tileValue));
    const normals = parsed.filter(t => t.number !== 0);
    const jokerCount = chunk.length - normals.length;

    if (normals.length === 0) return 0;

    if (this.isGroup(normals, jokerCount)) {
      return normals[0].number * chunk.length;
    }

    if (this.isRun(normals, jokerCount)) {
      const physicalParsed = chunk.map(t => this.parseTileValue(t.tileValue));
      const firstNormalIdx = physicalParsed.findIndex(t => t.number !== 0);
      const startNum = physicalParsed[firstNormalIdx].number - firstNormalIdx;
      const endNum = startNum + chunk.length - 1;
      return (chunk.length * (startNum + endNum)) / 2;
    }

    return 0;
  },

  parseTileValue(tileValue: string): { color: TileColor; number: number } {
    if (!tileValue || tileValue === "JOKER") {
      return { color: "JOKER", number: 0 };
    }
    const [colorStr, numStr] = tileValue.split("_");
    return { 
      color: colorStr as TileColor, 
      number: parseInt(numStr, 10) 
    };
  }
};