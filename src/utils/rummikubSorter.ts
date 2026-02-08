import { RummikubTile, RummikubBoardTile } from "@/types/rummikub";

const TILE_WIDTH = 55;  // 타일 가로 폭 + 여백
const TILE_HEIGHT = 75; // 타일 세로 폭 + 여백
const HAND_START_X = 50;  // 손패 영역 시작 X
const HAND_START_Y = 600; // 손패 영역 시작 Y (보드 하단)

export const RummikubSorter = {
  /**
   * 숫자 우선 정렬 (7-7-7-7...)
   */
  sortByNumber(tiles: RummikubTile[]): RummikubBoardTile[] {
    const sorted = [...tiles].sort((a, b) => {
      if (a.number !== b.number) return a.number - b.number;
      return a.color.localeCompare(b.color);
    });
    return this.assignPhysicalCoordinates(sorted);
  },

  /**
   * 색상 우선 정렬 (빨 1-2-3-4...)
   */
  sortByColor(tiles: RummikubTile[]): RummikubBoardTile[] {
    const colorOrder: Record<string, number> = { RED: 1, YELLOW: 2, BLUE: 3, BLACK: 4, JOKER: 5 };
    const sorted = [...tiles].sort((a, b) => {
      const colorA = colorOrder[a.color] || 99;
      const colorB = colorOrder[b.color] || 99;
      if (colorA !== colorB) return colorA - colorB;
      return a.number - b.number;
    });
    return this.assignPhysicalCoordinates(sorted);
  },

  /**
   * 정렬된 타일들에 실제 화면 좌표(px) 부여
   */
  assignPhysicalCoordinates(sortedTiles: RummikubTile[]): RummikubBoardTile[] {
    return sortedTiles.map((tile, index) => {
      const row = Math.floor(index / 18); // 한 줄에 18개씩 배치
      const col = index % 18;

      return {
        tileId: tile.id,
        tileValue: `${tile.color}_${tile.number}`,
        // 실제 렌더링될 픽셀 좌표 계산
        x: HAND_START_X + col * TILE_WIDTH,
        y: HAND_START_Y + row * TILE_HEIGHT,
        setId: 0 // 손패에서는 setId가 의미 없으므로 0
      };
    });
  }
};