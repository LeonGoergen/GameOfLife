import {GRID_CONSTANTS} from "../../../app.constants";

export class Cell {
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

  get neighbors() {
    return {
      tl: { x: this.x - GRID_CONSTANTS.CELL_SIZE, y: this.y - GRID_CONSTANTS.CELL_SIZE },
      t: { x: this.x, y: this.y - GRID_CONSTANTS.CELL_SIZE },
      tr: { x: this.x + GRID_CONSTANTS.CELL_SIZE, y: this.y - GRID_CONSTANTS.CELL_SIZE },
      l: { x: this.x - GRID_CONSTANTS.CELL_SIZE, y: this.y },
      r: { x: this.x + GRID_CONSTANTS.CELL_SIZE, y: this.y },
      bl: { x: this.x - GRID_CONSTANTS.CELL_SIZE, y: this.y + GRID_CONSTANTS.CELL_SIZE },
      b: { x: this.x, y: this.y + GRID_CONSTANTS.CELL_SIZE },
      br: { x: this.x + GRID_CONSTANTS.CELL_SIZE, y: this.y + GRID_CONSTANTS.CELL_SIZE },
    };
  }
}
