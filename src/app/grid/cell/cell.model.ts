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
      tl: { x: this.x - 1, y: this.y - 1 },
      t: { x: this.x, y: this.y - 1 },
      tr: { x: this.x + 1, y: this.y - 1 },
      l: { x: this.x - 1, y: this.y },
      r: { x: this.x + 1, y: this.y },
      bl: { x: this.x - 1, y: this.y + 1 },
      b: { x: this.x, y: this.y + 1 },
      br: { x: this.x + 1, y: this.y + 1 },
    };
  }
}
