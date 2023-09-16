import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {GRID_COLORS, GRID_CONSTANTS} from "../../app.constants";
import {TransformationMatrixService} from "./services/transformation-matrix.service";
import {Cell} from "./cell/cell.model";
import {GameService} from "../services/game.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit, AfterViewInit, OnDestroy {
  CANVAS_WIDTH = GRID_CONSTANTS.CANVAS_WIDTH;
  CANVAS_HEIGHT = GRID_CONSTANTS.CANVAS_HEIGHT;
  @ViewChild('gridCanvas', { static: true }) gridCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;

  private gridCtx!: CanvasRenderingContext2D;
  private gameCtx!: CanvasRenderingContext2D;

  private gridSize!: number;
  private userGridSize: number = GRID_CONSTANTS.INIT_GRID_SIZE;

  private cells: Map<string, Cell> = new Map();
  private cellsToCheck: Set<string> = new Set();

  private generationDeltas: Array<Map<string, boolean>> = [];
  public generationCount: number = 0;

  private panConfig = {
    isPanning: false,
    lastPanX: 0,
    lastPanY: 0,
    totalPanDistance: 0,
  };

  private subscriptions: Subscription[] = [];

  constructor(private transformationMatrixService: TransformationMatrixService,
              private gameService: GameService) {}

  ngOnInit() {
    this.subscriptions.push(
      this.gameService.nextGeneration$.subscribe(() => this.onNextGeneration()),
      this.gameService.lastGeneration$.subscribe(() => this.onLastGeneration()),
      this.gameService.reset$.subscribe(() => this.initGrid()),
      this.gameService.gridSize$.subscribe((size: number) => this.userGridSize = size),
  )};

  ngAfterViewInit(): void {
    this.gridCtx = this.gridCanvas.nativeElement.getContext('2d')!;
    this.gameCtx = this.gameCanvas.nativeElement.getContext('2d')!;

    this.initGrid();
  }

  initGrid(): void {
    this.cells.clear();
    this.cellsToCheck.clear();
    this.generationDeltas = [];
    this.generationCount = 0;
    this.gridSize = this.userGridSize;
    this.gridCtx.clearRect(0, 0, this.gridSize, this.gridSize);
    this.gameCtx.clearRect(0, 0, this.gridSize, this.gridSize);
    this.initializeGridCells();
    this.panToMiddle();
  }

  private panToMiddle(): void {
    const middleX = this.gridSize / 2;
    const middleY = this.gridSize / 2;

    const canvasRect = this.gridCanvas.nativeElement.getBoundingClientRect();
    const canvasMiddleX = canvasRect.width / 2;
    const canvasMiddleY = canvasRect.height / 2;

    const translateX = canvasMiddleX - middleX;
    const translateY = canvasMiddleY - middleY;

    this.transformationMatrixService.setTransform(1, 0, 0, 1, translateX, translateY);

    requestAnimationFrame(() => {
      this.drawGridLines();
      this.drawCells();
    });
  }

  drawGridLines(): void {
    this.gridCtx.clearRect(0, 0, this.gridSize, this.gridSize);
    this.gridCtx.setTransform(...this.transformationMatrixService.matrix as any);

    this.gridCtx.strokeStyle = GRID_COLORS.GRID_LINE;

    const gridSpacing = this.getGridSpacing();

    for (let y = 0, i = 0; y <= this.gridSize; y += GRID_CONSTANTS.CELL_SIZE * gridSpacing, i += gridSpacing) {
      this.gridCtx.lineWidth = (i % 60 === 0) ? 2 : 0.5;
      this.gridCtx.beginPath();
      this.gridCtx.moveTo(0, y);
      this.gridCtx.lineTo(this.gridSize, y);
      this.gridCtx.stroke();
    }

    for (let x = 0, i = 0; x <= this.gridSize; x += GRID_CONSTANTS.CELL_SIZE * gridSpacing, i += gridSpacing) {
      this.gridCtx.lineWidth = (i % 60 === 0) ? 2 : 0.5;
      this.gridCtx.beginPath();
      this.gridCtx.moveTo(x, 0);
      this.gridCtx.lineTo(x, this.gridSize);
      this.gridCtx.stroke();
    }
  }

  private getGridSpacing(): number {
    const zoomLevel = this.transformationMatrixService.matrix[0];
    let gridSpacing = 1;

    if (zoomLevel <= GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD && zoomLevel > GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD / 2) {
      gridSpacing = 2;
    } else if (zoomLevel <= GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD / 2 && zoomLevel > GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD / 4) {
      gridSpacing = 4;
    } else if (zoomLevel <= GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD / 4 && zoomLevel > GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD / 8) {
      gridSpacing = 8;
    } else if (zoomLevel <= GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD / 8 && zoomLevel > GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD / 16) {
      gridSpacing = 16;
    }

    return gridSpacing;
  }

  initializeGridCells(): void {
    const cellSize = GRID_CONSTANTS.CELL_SIZE;
    const range = Array.from({length: this.gridSize / cellSize}, (_, i) => i * cellSize);

    const cellPositions = range.flatMap(x => range.map(y => ({ x, y })));

    cellPositions.forEach(({ x, y }) => {
      const cell = new Cell(x, y, false);
      this.cells.set(cell.key, cell);
      if (cell.alive) { this.cellsToCheck.add(cell.key); }
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
      if (cell.alive)
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
    if (!this.panConfig.isPanning) { return; }

    const deltaX = event.clientX - this.panConfig.lastPanX;
    const deltaY = event.clientY - this.panConfig.lastPanY;

    this.transformationMatrixService.translate(deltaX, deltaY, this.gridSize);

    this.panConfig.lastPanX = event.clientX;
    this.panConfig.lastPanY = event.clientY;

    this.panConfig.totalPanDistance += Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    requestAnimationFrame(() => {
      this.drawGridLines();
      this.drawCells();
    });
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
    this.transformationMatrixService.scaleAt({ x, y }, amount, this.gridSize);

    requestAnimationFrame(() => {
      this.drawGridLines();
      this.drawCells();
    });
  }

  onCanvasClick(event: MouseEvent): void {
    if (this.panConfig.totalPanDistance > GRID_CONSTANTS.PAN_DISTANCE_THRESHOLD) { return; }

    const key = this.getCellKeyByCoordinates(event);
    const cell = this.cells.get(key);

    if (!cell) { return; }

    cell.alive = !cell.alive;
    cell.alive ? this.cellsToCheck.add(key) : this.cellsToCheck.delete(key);

    this.drawCells();
  }

  getCellKeyByCoordinates(event: MouseEvent) {
    const rect = this.gameCanvas.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const inverseMatrix = this.transformationMatrixService.inverseMatrix;
    const worldPoint = this.transformationMatrixService.transformPoint({ x, y }, inverseMatrix);

    const cellX = Math.floor(worldPoint.x / GRID_CONSTANTS.CELL_SIZE) * GRID_CONSTANTS.CELL_SIZE;
    const cellY = Math.floor(worldPoint.y / GRID_CONSTANTS.CELL_SIZE) * GRID_CONSTANTS.CELL_SIZE;
    return `${cellX},${cellY}`;
  }

  onNextGeneration(): void {
    const newCellsToCheck = new Set<string>();
    const cellsToUpdate = new Map<string, boolean>();

    const allCellsToCheck = this.getAllCellsToCheck();
    allCellsToCheck.forEach(key => this.determineNewCellState(key, cellsToUpdate));
    this.updateCellsAndNewCellsToCheck(cellsToUpdate, newCellsToCheck);

    this.generationDeltas.push(cellsToUpdate);
    if (this.generationDeltas.length > 500) { this.generationDeltas.shift(); }

    this.cellsToCheck = newCellsToCheck;
    requestAnimationFrame(() => { this.drawCells(); });

    if (this.cellsToCheck.size > 0) { this.generationCount += 1; }
  }

  private getAllCellsToCheck(): Set<string> {
    const allCellsToCheck = new Set<string>();
    this.cellsToCheck.forEach(key => {
      allCellsToCheck.add(key);
      const cell = this.cells.get(key);
      if (!cell) {return;}
      Object.values(cell.neighbors).forEach(neighbor => {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        allCellsToCheck.add(neighborKey);
      });
    });
    return allCellsToCheck;
  }

  private determineNewCellState(key: string, cellsToUpdate: Map<string, boolean>): void {
    const cell = this.cells.get(key);
    if (!cell) {return;}

    let aliveNeighbors = 0;
    Object.values(cell.neighbors).forEach(neighbor => {
      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (this.cells.get(neighborKey)?.alive) { aliveNeighbors += 1; }
    });

    const alive = cell.alive;
    if (alive && (aliveNeighbors < 2 || aliveNeighbors > 3)) { cellsToUpdate.set(key, false); }
    else if (!alive && aliveNeighbors === 3) { cellsToUpdate.set(key, true); }
  }

  private updateCellsAndNewCellsToCheck(cellsToUpdate: Map<string, boolean>, newCellsToCheck: Set<string>): void {
    cellsToUpdate.forEach((newState, key) => {
      const cell = this.cells.get(key);
      if (!cell) { return; }
      cell.alive = newState;
      newCellsToCheck.add(key);
      Object.values(cell.neighbors).forEach(neighbor => {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        newCellsToCheck.add(neighborKey);
      });
    });
  }

  private onLastGeneration(): void {
    if (this.generationDeltas.length <= 0) { return; }

    const lastGenerationDeltas = this.generationDeltas.pop()!;

    lastGenerationDeltas.forEach((newState, key) => {
      const cell = this.cells.get(key);
      if (!cell) { return; }
      cell.alive = !newState;
      this.cellsToCheck.add(key);
      Object.values(cell.neighbors).forEach(neighbor => {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        this.cellsToCheck.add(neighborKey);
      });
    });

    requestAnimationFrame(() => { this.drawCells(); });
    this.generationCount -= 1;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
