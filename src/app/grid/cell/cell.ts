import {GRID_CONSTANTS} from "../../app.constants";
import {ICell} from "./icell.model";

export class Cell implements ICell {
  public alive: boolean;
  public x: number;
  public y: number;

  constructor(x: number, y: number, alive: boolean) {
    this.x = x;
    this.y = y;
    this.alive = alive;
  }

  get key() {
    return `${this.x},${this.y}`;
  }

  private static neighborOffsets: { dx: number, dy: number }[] = [
    { dx: -GRID_CONSTANTS.CELL_SIZE, dy: -GRID_CONSTANTS.CELL_SIZE }, // tl
    { dx: 0, dy: -GRID_CONSTANTS.CELL_SIZE },                         // t
    { dx: GRID_CONSTANTS.CELL_SIZE, dy: -GRID_CONSTANTS.CELL_SIZE },  // tr
    { dx: -GRID_CONSTANTS.CELL_SIZE, dy: 0 },                         // l
    { dx: GRID_CONSTANTS.CELL_SIZE, dy: 0 },                          // r
    { dx: -GRID_CONSTANTS.CELL_SIZE, dy: GRID_CONSTANTS.CELL_SIZE },  // bl
    { dx: 0, dy: GRID_CONSTANTS.CELL_SIZE },                          // b
    { dx: GRID_CONSTANTS.CELL_SIZE, dy: GRID_CONSTANTS.CELL_SIZE }    // br
  ];

  get neighbors() {
    return Cell.neighborOffsets.map(offset => `${this.x + offset.dx},${this.y + offset.dy}`);
  }

  getToroidalNeighbors(gridSize: number) {
    return Cell.neighborOffsets.map(offset => {
      const nx = (this.x + offset.dx + gridSize) % gridSize;
      const ny = (this.y + offset.dy + gridSize) % gridSize;
      return `${nx},${ny}`;
    });
  }
}
