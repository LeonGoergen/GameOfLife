import { ICell } from "./icell.model";

export class Cell implements ICell {
  private readonly cellSize: number;
  public alive: boolean;
  public x: number;
  public y: number;

  constructor(x: number, y: number, alive: boolean, cellSize: number) {
    this.x = x;
    this.y = y;
    this.alive = alive;
    this.cellSize = cellSize;
  }

  get key() {
    return `${this.x},${this.y}`;
  }

  static getNeighborOffsets(cellSize: number): { dx: number; dy: number }[] {
    return [
      { dx: -cellSize, dy: -cellSize }, // tl
      { dx: 0, dy: -cellSize },         // t
      { dx: cellSize, dy: -cellSize },  // tr
      { dx: -cellSize, dy: 0 },         // l
      { dx: cellSize, dy: 0 },          // r
      { dx: -cellSize, dy: cellSize },  // bl
      { dx: 0, dy: cellSize },          // b
      { dx: cellSize, dy: cellSize },   // br
    ];
  }

  get neighbors() {
    const neighborOffsets = Cell.getNeighborOffsets(this.cellSize);
    return neighborOffsets.map(offset => `${this.x + offset.dx},${this.y + offset.dy}`);
  }

  getToroidalNeighbors(gridSize: number) {
    const neighborOffsets = Cell.getNeighborOffsets(this.cellSize);
    return neighborOffsets.map(offset => {
      const nx = (this.x + offset.dx + gridSize) % gridSize;
      const ny = (this.y + offset.dy + gridSize) % gridSize;
      return `${nx},${ny}`;
    });
  }
}
