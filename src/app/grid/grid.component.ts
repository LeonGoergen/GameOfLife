import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {GRID_CONSTANTS, GRID_COLORS} from "../app.constants";
import {TransformationMatrixService} from "./services/transformation-matrix.service";
import {Cell} from "./cell/cell.model";

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit {
  @ViewChild('gridCanvas', { static: true }) gridCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;

  private gridCtx!: CanvasRenderingContext2D;
  private gameCtx!: CanvasRenderingContext2D;

  private gridSize!: number;

  private cells: Map<string, Cell> = new Map();
  private cellsToCheck: Set<string> = new Set();

  private panConfig = {
    isPanning: false,
    lastPanX: 0,
    lastPanY: 0,
    totalPanDistance: 0,
  };

  constructor(private transformationMatrixService: TransformationMatrixService) {}

  ngOnInit(): void {
    this.gridSize = GRID_CONSTANTS.GRID_SIZE;

    this.gridCtx = this.gridCanvas.nativeElement.getContext('2d')!;
    this.drawGridLines();

    this.gameCtx = this.gameCanvas.nativeElement.getContext('2d')!;
    this.initializeGridCells();
    this.drawCells();
  }

  drawGridLines(): void {
    this.gridCtx.clearRect(0, 0, this.gridSize, this.gridSize);
    this.gridCtx.setTransform(...this.transformationMatrixService.matrix as any);

    this.gridCtx.strokeStyle = GRID_COLORS.GRID_LINE;

    for (let y = 0; y <= this.gridSize; y += GRID_CONSTANTS.CELL_SIZE) {
      this.gridCtx.beginPath();
      this.gridCtx.moveTo(0, y);
      this.gridCtx.lineTo(this.gridSize, y);
      this.gridCtx.stroke();
    }

    for (let x = 0; x <= this.gridSize; x += GRID_CONSTANTS.CELL_SIZE) {
      this.gridCtx.beginPath();
      this.gridCtx.moveTo(x, 0);
      this.gridCtx.lineTo(x, this.gridSize);
      this.gridCtx.stroke();
    }
  }

  initializeGridCells(): void {
    const cellSize = GRID_CONSTANTS.CELL_SIZE;
    const range = Array.from({length: this.gridSize / cellSize}, (_, i) => i * cellSize);

    const cellPositions = range.flatMap(x => range.map(y => ({ x, y })));

    cellPositions.forEach(({ x, y }) => {
      const cell = new Cell(x, y, Math.random() < 0.1);
      this.cells.set(cell.key, cell);
      if (cell.alive) {
        this.cellsToCheck.add(cell.key);
      }
    });
  }

  drawCells(): void {
    const visibleGridRange = this.getVisibleGridRange();

    this.gameCtx.clearRect(0, 0, this.gridSize, this.gridSize);
    this.gameCtx.setTransform(...this.transformationMatrixService.matrix as any);

    this.gameCtx.fillStyle = GRID_COLORS.DEAD;
    this.gameCtx.fillRect(0, 0, this.gridSize, this.gridSize);

    this.gameCtx.fillStyle = GRID_COLORS.ALIVE;

    const cellsToCheck = this.getCellsToCheck(visibleGridRange);
    cellsToCheck.forEach(cell => {
      if (cell && cell.alive)
        this.gameCtx.fillRect(cell.x, cell.y, GRID_CONSTANTS.CELL_SIZE, GRID_CONSTANTS.CELL_SIZE);
    });
  }

  getVisibleGridRange() {
    const rect = this.gameCanvas.nativeElement.getBoundingClientRect();

    const inverseMatrix = this.transformationMatrixService.inverseMatrix;
    const topLeft = this.transformationMatrixService.transformPoint({x: 0, y: 0}, inverseMatrix);
    const bottomRight = this.transformationMatrixService.transformPoint({x: rect.width, y: rect.height}, inverseMatrix);

    const startCol = Math.floor(topLeft.x / GRID_CONSTANTS.CELL_SIZE);
    const endCol = Math.ceil(bottomRight.x / GRID_CONSTANTS.CELL_SIZE);
    const startRow = Math.floor(topLeft.y / GRID_CONSTANTS.CELL_SIZE);
    const endRow = Math.ceil(bottomRight.y / GRID_CONSTANTS.CELL_SIZE);

    return {startCol, endCol, startRow, endRow};
  }

  getCellsToCheck(visibleGridRange: any): Cell[] {
    const keys: string[] = [];

    for (let x = visibleGridRange.startCol; x <= visibleGridRange.endCol; x++) {
      for (let y = visibleGridRange.startRow; y <= visibleGridRange.endRow; y++) {
        keys.push(`${x * GRID_CONSTANTS.CELL_SIZE},${y * GRID_CONSTANTS.CELL_SIZE}`);
      }
    }

    return keys
      .filter(key => this.cellsToCheck.has(key))
      .map(key => this.cells.get(key))
      .filter((cell): cell is Cell => cell !== undefined);
  }

  startPan(event: MouseEvent): void {
    this.panConfig.isPanning = true;
    this.panConfig.lastPanX = event.clientX;
    this.panConfig.lastPanY = event.clientY;
    this.panConfig.totalPanDistance = 0;
  }

  pan(event: MouseEvent): void {
    if (this.panConfig.isPanning) {
      const deltaX = event.clientX - this.panConfig.lastPanX;
      const deltaY = event.clientY - this.panConfig.lastPanY;

      this.transformationMatrixService.translate(deltaX, deltaY);

      this.panConfig.lastPanX = event.clientX;
      this.panConfig.lastPanY = event.clientY;

      this.panConfig.totalPanDistance += Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      requestAnimationFrame(() => {
        this.drawGridLines();
        this.drawCells();
      });
    }
  }

  endPan(): void {
    this.panConfig.isPanning = false;
  }

  zoom(event: WheelEvent): void {
    event.preventDefault();

    const rect = this.gridCanvas.nativeElement.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const amount = 1 - event.deltaY * GRID_CONSTANTS.ZOOM_FACTOR;
    this.transformationMatrixService.scaleAt({ x, y }, amount);

    requestAnimationFrame(() => {
      this.drawGridLines();
      this.drawCells();
    });
  }
}
