import { BoardTile } from "@/store/useRummikubStore";

export const RummikubSorter = {
  /**
   * 숫자 우선 정렬 (Group 중심: 1-1-1, 2-2-2...)
   */
  sortByNumber(tiles: BoardTile[]): BoardTile[] {
    const sorted = [...tiles].sort((a, b) => {
      if (a.number !== b.number) return a.number - b.number;
      return a.color.localeCompare(b.color);
    });
    return this.assignCoordinates(sorted);
  },

  /**
   * 색상 우선 정렬 (Run 중심: 빨1-2-3, 파1-2-3...)
   */
  sortByColor(tiles: BoardTile[]): BoardTile[] {
    const colorOrder = { RED: 1, YELLOW: 2, BLUE: 3, BLACK: 4, JOKER: 5 };
    const sorted = [...tiles].sort((a, b) => {
      if (a.color !== b.color) return colorOrder[a.color] - colorOrder[b.color];
      return a.number - b.number;
    });
    return this.assignCoordinates(sorted);
  },

  /**
   * 정렬된 배열을 2단 손패 격자(20열)에 배치
   */
  assignCoordinates(sortedTiles: BoardTile[]): BoardTile[] {
    return sortedTiles.map((tile, index) => ({
      ...tile,
      x: Math.floor(index / 20), // 0번 줄 혹은 1번 줄
      y: index % 20,             // 0~19번 칸
    }));
  }
};