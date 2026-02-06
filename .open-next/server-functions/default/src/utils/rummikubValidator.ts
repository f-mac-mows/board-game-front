import { BoardTile } from "@/store/useRummikubStore";
import { RummikubTile } from "@/types/rummikub";

export const RummikubValidator = {
  /**
   * 1. 타일들을 뭉치(Set) 단위로 분리 (BoardTile[][] 반환)
   */
  getRowsWithChunks(tiles: BoardTile[]): BoardTile[][] {
    const rowMap: Record<number, BoardTile[]> = {};
    tiles.forEach((t) => {
      if (!rowMap[t.x]) rowMap[t.x] = [];
      rowMap[t.x].push(t);
    });

    const allChunks: BoardTile[][] = [];
    Object.values(rowMap).forEach((rowTiles) => {
      const sorted = [...rowTiles].sort((a, b) => a.y - b.y);
      let currentChunk: BoardTile[] = [];

      sorted.forEach((tile, i) => {
        if (i === 0) {
          currentChunk.push(tile);
        } else {
          if (tile.y === sorted[i - 1].y + 1) {
            currentChunk.push(tile);
          } else {
            allChunks.push(currentChunk);
            currentChunk = [tile];
          }
        }
      });
      if (currentChunk.length > 0) allChunks.push(currentChunk);
    });
    return allChunks;
  },

  /**
   * 2. 보드 전체 유효성 검사
   */
  validateBoard(boardTiles: BoardTile[]): { isValid: boolean; invalidTileIds: string[] } {
    const invalidTileIds: string[] = [];
    const chunks = this.getRowsWithChunks(boardTiles);

    chunks.forEach((chunk) => {
      if (!this.isValidSet(chunk)) {
        chunk.forEach((t) => invalidTileIds.push(t.id.toString()));
      }
    });

    return {
      isValid: invalidTileIds.length === 0 && boardTiles.length > 0,
      invalidTileIds,
    };
  },

  /**
   * 3. 단일 뭉치 유효성 검사 (RummikubTile[] 호환)
   */
  isValidSet(chunk: RummikubTile[]): boolean {
    if (chunk.length < 3) return false;
    const jokers = chunk.filter((t) => t.joker);
    const normals = chunk.filter((t) => !t.joker);

    return this.isGroup(normals, jokers.length) || this.isRun(normals, jokers.length);
  },

  isGroup(normals: RummikubTile[], jokerCount: number): boolean {
    if (normals.length + jokerCount > 4 || normals.length === 0) return false;
    const isSameNumber = normals.every((t) => t.number === normals[0].number);
    const isDifferentColor = new Set(normals.map((t) => t.color)).size === normals.length;
    return isSameNumber && isDifferentColor;
  },

  isRun(normals: RummikubTile[], jokerCount: number): boolean {
    if (normals.length === 0) return jokerCount >= 3;
    const isSameColor = new Set(normals.map((t) => t.color)).size === 1;
    if (!isSameColor) return false;

    const sortedNums = normals.map((t) => t.number).sort((a, b) => a - b);
    let neededJokers = 0;
    for (let i = 1; i < sortedNums.length; i++) {
      const gap = sortedNums[i] - sortedNums[i - 1] - 1;
      if (gap < 0) return false; // 중복 숫자 안됨
      neededJokers += gap;
    }
    return neededJokers <= jokerCount;
  },

  /**
   * 4. 점수 계산 (Initial Meld 30점 체크용)
   */
  calculateMeldScore(chunks: RummikubTile[][]): number {
    return chunks.reduce((total, chunk) => {
      const jokers = chunk.filter((t) => t.joker);
      const normals = chunk.filter((t) => !t.joker);

      if (this.isGroup(normals, jokers.length)) {
        return total + normals[0].number * chunk.length;
      }

      if (this.isRun(normals, jokers.length)) {
        // Run 내의 실제 숫자들을 유추하여 합산 (y좌표 정렬 기준)
        // chunk가 BoardTile인 경우 좌표를 쓰고, 아니면 인덱스를 사용
        const firstNormalIdx = chunk.findIndex((t) => !t.joker);
        if (firstNormalIdx === -1) return total;
        
        const startNum = chunk[firstNormalIdx].number - firstNormalIdx;
        const n = chunk.length;
        const chunkSum = (n * (2 * startNum + n - 1)) / 2;
        return total + chunkSum;
      }
      return total;
    }, 0);
  },
};