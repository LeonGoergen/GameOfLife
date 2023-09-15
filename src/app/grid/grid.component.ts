import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {GRID_CONSTANTS} from "../app.constants";
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

    this.gridCtx.strokeStyle = '#000';

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
    for (let x = 0; x < this.gridSize; x += GRID_CONSTANTS.CELL_SIZE) {
      for (let y = 0; y < this.gridSize; y += GRID_CONSTANTS.CELL_SIZE) {
        const cell = new Cell(x, y, Math.random() < 0.1);
        this.cells.set(cell.key, cell);
        if (cell.alive) {
          this.cellsToCheck.add(cell.key);
        }
      }
    }
  }

  drawCells(): void {
    this.gameCtx.clearRect(0, 0, this.gridSize, this.gridSize);
    this.gameCtx.setTransform(...this.transformationMatrixService.matrix as any);
    this.gameCtx.fillStyle = '#3b3b3b';

    this.cellsToCheck.forEach((key) => {
      const cell = this.cells.get(key)!;
      cell.alive
        ? this.gameCtx.fillRect(cell.x, cell.y, GRID_CONSTANTS.CELL_SIZE, GRID_CONSTANTS.CELL_SIZE)
        : this.gameCtx.clearRect(cell.x, cell.y, GRID_CONSTANTS.CELL_SIZE, GRID_CONSTANTS.CELL_SIZE);
    });
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
