interface Point {
  x: number;
  y: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class QuadTree {
  private nodes: QuadTree[] = [];
  private elements: Point[] = [];

  constructor(
    private x: number,
    private y: number,
    private width: number,
    private height: number,
    private maxElements: number = 4
  ) {}

  insert(element: Point): void {
    if (this.nodes.length === 0 && this.elements.length < this.maxElements) {
      this.elements.push(element);
      return;
    }

    if (this.nodes.length === 0) {
      this.subdivide();
    }

    for (const node of this.nodes) {
      if (node.contains(element)) {
        node.insert(element);
        return;
      }
    }
  }

  retrieve(area: Area): Point[] {
    let found: Point[] = [];

    if (!this.intersects(area)) {
      return found;
    }

    for (const element of this.elements) {
      if (this.contains(element)) {
        found.push(element);
      }
    }

    if (this.nodes.length === 0) {
      return found;
    }

    for (const node of this.nodes) {
      found = found.concat(node.retrieve(area));
    }

    return found;
  }

  private subdivide(): void {
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;

    this.nodes.push(new QuadTree(this.x, this.y, halfWidth, halfHeight, this.maxElements));
    this.nodes.push(new QuadTree(this.x + halfWidth, this.y, halfWidth, halfHeight, this.maxElements));
    this.nodes.push(new QuadTree(this.x, this.y + halfHeight, halfWidth, halfHeight, this.maxElements));
    this.nodes.push(new QuadTree(this.x + halfWidth, this.y + halfHeight, halfWidth, halfHeight, this.maxElements));

    for (const element of this.elements) {
      this.insert(element);
    }

    this.elements = [];
  }

  private contains(point: Point): boolean {
    return point.x >= this.x &&
      point.x < this.x + this.width &&
      point.y >= this.y &&
      point.y < this.y + this.height;
  }

  private intersects(area: Area): boolean {
    return this.x < area.x + area.width &&
      this.x + this.width > area.x &&
      this.y < area.y + area.height &&
      this.y + this.height > area.y;
  }
}
