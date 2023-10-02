export interface GridProperties {
  gridSize: number;
  userGridSize: number;
  cellSize: number;
  gridLines: boolean;
  isToroidal: boolean;
  visibleGridRange: {startCol: number, endCol: number, startRow: number, endRow: number};
  totalPanDistance: number;
}
