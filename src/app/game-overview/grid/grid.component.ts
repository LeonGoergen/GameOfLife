import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {GRID_COLORS, GRID_CONSTANTS} from "../../app.constants";
import {TransformationMatrixService} from "../services/transformation-matrix.service";
import {Cell} from "./cell/cell.model";
import {GameService} from "../services/game.service";
import {Subscription} from "rxjs";
import {RleService} from "../services/rle.service";

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit, AfterViewInit, OnDestroy {
  CANVAS_WIDTH: number = GRID_CONSTANTS.CANVAS_WIDTH;
  CANVAS_HEIGHT: number = GRID_CONSTANTS.CANVAS_HEIGHT;

  @ViewChild('gridCanvas', { static: true }) gridCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  private offscreenCanvas!: HTMLCanvasElement;

  private gridCtx!: CanvasRenderingContext2D;
  private gameCtx!: CanvasRenderingContext2D;
  private offscreenCtx!: CanvasRenderingContext2D;

  protected gridSize: number = GRID_CONSTANTS.INIT_GRID_SIZE;
  private userGridSize: number = GRID_CONSTANTS.INIT_GRID_SIZE;
  private isToroidal: boolean = true;
  private gridLines: boolean = true;

  private cells: Map<string, Cell> = new Map();
  private visibleGridRange!: {startCol: number, endCol: number, startRow: number, endRow: number};
  private cellsToCheck: Set<string> = new Set();

  private generationDeltas: Array<Map<string, boolean>> = [];
  public generationCount: number = 0;
  private checkpoint: Set<string> = new Set();

  private frameCount: number = 0;
  protected totalPanDistance: number = 0;

  private subscriptions: Subscription[] = [];

  constructor(private transformationMatrixService: TransformationMatrixService,
              private gameService: GameService,
              private rleService: RleService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.gameService.nextGeneration$.subscribe((drawing: boolean) => this.onNextGeneration(drawing)),
      this.gameService.lastGeneration$.subscribe(() => this.onLastGeneration()),
      this.gameService.reset$.subscribe(() => this.initGrid()),
      this.gameService.gridSize$.subscribe((size: number) => this.userGridSize = size),
      this.gameService.toroidalGrid$.subscribe((isToroidal: boolean) => this.isToroidal = isToroidal),
      this.gameService.gridLines$.subscribe((gridLines: boolean) => this.toggleGridLines(gridLines)),
      this.gameService.saveCheckpoint$.subscribe(() => this.saveCheckpoint()),
      this.gameService.returnToCheckpoint$.subscribe(() => this.returnToCheckpoint()),
      this.rleService.rleLoaded$.subscribe((cells: Cell[]) => this.onCellsLoaded(cells)),
  )};

  ngAfterViewInit(): void {
    this.gridCtx = this.gridCanvas.nativeElement.getContext('2d')!;
    this.gameCtx = this.gameCanvas.nativeElement.getContext('2d')!;

    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.CANVAS_WIDTH;
    this.offscreenCanvas.height = this.CANVAS_HEIGHT;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')!;

    this.initGrid();

    setInterval(() => this.updateFPSDisplay(), 100);
  }

  private initGrid(): void {
    this.cells.clear();
    this.cellsToCheck.clear();
    this.generationDeltas = [];
    this.generationCount = 0;
    this.gridSize = this.userGridSize;
    this.gridCtx.clearRect(0, 0, this.gridSize, this.gridSize);
    this.gameCtx.clearRect(0, 0, this.gridSize, this.gridSize);
    this.initializeGridCells();
    this.panToMiddle();
    this.getVisibleGridRange();
  }

  private updateFPSDisplay(): void {
    this.gameService.updateFps(this.frameCount * 10);
    this.frameCount = 0;
  }

  private panToMiddle(): void {
    const middleX: number = this.gridSize / 2;
    const middleY: number = this.gridSize / 2;

    const canvasRect: DOMRect = this.gridCanvas.nativeElement.getBoundingClientRect();
    const canvasMiddleX: number = canvasRect.width / 2;
    const canvasMiddleY: number = canvasRect.height / 2;

    const translateX: number = canvasMiddleX - middleX;
    const translateY: number = canvasMiddleY - middleY;

    this.transformationMatrixService.setTransform(1, 0, 0, 1, translateX, translateY);

    requestAnimationFrame((): void => {
      this.drawGridLines();
      this.drawCells();
    });
  }

  private toggleGridLines(gridLines: boolean): void {
    this.gridLines = gridLines;
    this.drawGridLines();
  }

  private drawGridLines(): void {
    this.gridCtx.clearRect(0, 0, this.gridSize, this.gridSize);

    if (!this.gridLines) { return; }

    this.gridCtx.setTransform(...this.transformationMatrixService.matrix as any);
    this.gridCtx.strokeStyle = GRID_COLORS.GRID_LINE;

    const gridSpacing: number = this.getGridSpacing();

    for (let y: number = 0, i: number= 0; y <= this.gridSize; y += GRID_CONSTANTS.CELL_SIZE * gridSpacing, i += gridSpacing) {
      this.gridCtx.lineWidth = (i % 6 === 0) ? 2 : 0.5;
      this.gridCtx.beginPath();
      this.gridCtx.moveTo(0, y);
      this.gridCtx.lineTo(this.gridSize, y);
      this.gridCtx.stroke();
    }

    for (let x: number = 0, i: number = 0; x <= this.gridSize; x += GRID_CONSTANTS.CELL_SIZE * gridSpacing, i += gridSpacing) {
      this.gridCtx.lineWidth = (i % 6 === 0) ? 2 : 0.5;
      this.gridCtx.beginPath();
      this.gridCtx.moveTo(x, 0);
      this.gridCtx.lineTo(x, this.gridSize);
      this.gridCtx.stroke();
    }
  }

  private getGridSpacing(): number {
    const zoomLevel: number = this.transformationMatrixService.matrix[0];
    let gridSpacing: number;

    const division: number = GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD / zoomLevel;
    gridSpacing = Math.pow(2, Math.ceil(Math.log2(division)));

    return gridSpacing;
  }

  private initializeGridCells(): void {
    const cellSize: number = GRID_CONSTANTS.CELL_SIZE;
    const range: number[] = Array.from({length: this.gridSize / cellSize}, (_, i: number) => i * cellSize);

    const cellPositions: {x: number, y: number}[] = range.flatMap(x => range.map(y => ({ x, y })));

    cellPositions.forEach(({ x, y }) => {
      const cell: Cell = new Cell(x, y, false);
      this.cells.set(cell.key, cell);
      if (cell.alive) { this.cellsToCheck.add(cell.key); }
    });
  }

  private drawCells(): void {
    const startX: number = this.visibleGridRange.startCol * GRID_CONSTANTS.CELL_SIZE;
    const startY: number = this.visibleGridRange.startRow * GRID_CONSTANTS.CELL_SIZE;
    const width: number = (this.visibleGridRange.endCol - this.visibleGridRange.startCol) * GRID_CONSTANTS.CELL_SIZE;
    const height: number = (this.visibleGridRange.endRow - this.visibleGridRange.startRow) * GRID_CONSTANTS.CELL_SIZE;

    this.offscreenCtx.clearRect(startX, startY, width, height);
    this.offscreenCtx.setTransform(...this.transformationMatrixService.matrix as any);
    this.offscreenCtx.fillStyle = GRID_COLORS.DEAD;
    this.offscreenCtx.fillRect(startX, startY, width, height);
    this.offscreenCtx.fillStyle = GRID_COLORS.ALIVE;

    const cellsToCheck: Cell[] = this.getCellsToCheck();
    cellsToCheck.forEach(cell => {
      if (cell.alive)
        this.offscreenCtx.fillRect(cell.x, cell.y, GRID_CONSTANTS.CELL_SIZE, GRID_CONSTANTS.CELL_SIZE);
    });

    this.gameCtx.drawImage(this.offscreenCanvas, 0, 0);
  }

  private getVisibleGridRange(): void  {
    const rect: DOMRect = this.gameCanvas.nativeElement.getBoundingClientRect();

    const inverseMatrix: number[] = this.transformationMatrixService.inverseMatrix;
    const topLeft: {x: number, y:number} = this.transformationMatrixService.transformPoint({x: 0, y: 0}, inverseMatrix);
    const bottomRight: {x: number, y:number} = this.transformationMatrixService.transformPoint({x: rect.width, y: rect.height}, inverseMatrix);

    const startCol: number = Math.floor(topLeft.x / GRID_CONSTANTS.CELL_SIZE);
    const endCol: number = Math.ceil(bottomRight.x / GRID_CONSTANTS.CELL_SIZE);
    const startRow: number = Math.floor(topLeft.y / GRID_CONSTANTS.CELL_SIZE);
    const endRow: number = Math.ceil(bottomRight.y / GRID_CONSTANTS.CELL_SIZE);

    this.visibleGridRange = {startCol, endCol, startRow, endRow};
  }

  private getCellsToCheck(): Cell[] { //TODO: Performance improvement
    const keys: string[] = [];

    for (let x: number = this.visibleGridRange.startCol; x <= this.visibleGridRange.endCol; x++) {
      for (let y: number = this.visibleGridRange.startRow; y <= this.visibleGridRange.endRow; y++) {
        keys.push(`${x * GRID_CONSTANTS.CELL_SIZE},${y * GRID_CONSTANTS.CELL_SIZE}`);
      }
    }

    return keys
      .filter(key => this.cellsToCheck.has(key))
      .map(key => this.cells.get(key))
      .filter((cell): cell is Cell => cell !== undefined);
  }

  protected handlePan(totalPanDistance: number): void {
    this.totalPanDistance = totalPanDistance;
    this.getVisibleGridRange();
    requestAnimationFrame(() => {
      this.drawGridLines();
      this.drawCells();
    });
  }

  protected handleZoom(): void {
    this.getVisibleGridRange();
    requestAnimationFrame(() => {
      this.drawGridLines();
      this.drawCells();
    });
  }

  protected handleCanvasClick(key: string): void {
    const cell: Cell | undefined = this.cells.get(key);
    if (!cell) { return; }

    cell.alive = !cell.alive;
    cell.alive ? this.cellsToCheck.add(key) : this.cellsToCheck.delete(key);

    requestAnimationFrame(() => {
      this.drawCells();
    });
  }

  protected async handleRightClick(key: string): Promise<void> {
    const cell: Cell = this.cells.get(key)!;
    const rleString: string = await navigator.clipboard.readText();
    this.rleService.decodeRLE(rleString, cell.x, cell.y);
  }

  private onCellsLoaded(cells: Cell[]): void {
    cells.forEach(cell => {
      this.cells.set(cell.key, cell);
      this.cellsToCheck.add(cell.key);
    });

    requestAnimationFrame(() => {
      this.drawCells();
    });
  }

  private startTime: any;

  private onNextGeneration(drawing: boolean): void {
    if (!this.startTime) { this.startTime = performance.now(); }
    const newCellsToCheck: Set<string> = new Set<string>();
    const aliveCells: Map<string, boolean> = new Map<string, boolean>();

    const allCellsToCheck: Set<string> = this.getAllCellsToCheck();
    allCellsToCheck.forEach(key => this.determineNewCellState(key, aliveCells));
    this.convertToSet(aliveCells, newCellsToCheck);

    this.generationDeltas.push(aliveCells);
    if (this.generationDeltas.length > 500) { this.generationDeltas.shift(); }

    this.cellsToCheck = newCellsToCheck;

    if (drawing)
      requestAnimationFrame((): void => { this.drawCells(); });

    if (this.cellsToCheck.size > 0) { this.generationCount += 1; }
    if (this.generationCount === 1000) { console.log(performance.now() - this.startTime); }
    this.frameCount += 1;
  }

  private getNeighborKeys(cell: Cell): string[] {
    return this.isToroidal ? cell.getToroidalNeighbors(this.gridSize) : cell.neighbors;
  }

  private getAllCellsToCheck(): Set<string> {
    const allCellsToCheck: Set<string> = new Set<string>();

    this.cellsToCheck.forEach(key => {
      const cell: Cell | undefined = this.cells.get(key);
      if (!cell) { return; }
      allCellsToCheck.add(key);
      this.getNeighborKeys(cell).forEach(neighborKey => allCellsToCheck.add(neighborKey));
    });

    return allCellsToCheck;
  }

  private determineNewCellState(key: string, aliveCells: Map<string, boolean>): void {
    const cell: Cell | undefined = this.cells.get(key);
    if (!cell) { return; }

    const aliveNeighbors: number = this.getNeighborKeys(cell)
      .reduce((count: number, neighborKey: string) => count + (this.cells.get(neighborKey)?.alive ? 1 : 0), 0);

    const shouldUpdate: boolean = cell.alive ? (aliveNeighbors < 2 || aliveNeighbors > 3) : (aliveNeighbors === 3);

    if (shouldUpdate)
      aliveCells.set(key, !cell.alive);
    else if (cell.alive)
      aliveCells.set(key, cell.alive);
  }

  private convertToSet(aliveCells: Map<string, boolean>, newCellsToCheck: Set<string>): void {
    aliveCells.forEach((newState: boolean, key: string): void => {
      const cell: Cell | undefined = this.cells.get(key);
      if (!cell) { return; }

      cell.alive = newState;
      newCellsToCheck.add(key);
    });
  }

  private onLastGeneration(): void {
    if (this.generationDeltas.length <= 0) { return; }

    const lastGenerationDeltas: Map<string, boolean> = this.generationDeltas.pop()!;

    lastGenerationDeltas.forEach((newState: boolean, key: string): void => {
      const cell: Cell | undefined = this.cells.get(key);
      if (!cell) { return; }

      cell.alive = !newState;
      this.cellsToCheck.add(key);
      this.getNeighborKeys(cell).forEach(neighborKey => this.cellsToCheck.add(neighborKey));
    });

    requestAnimationFrame((): void => { this.drawCells(); });
    this.generationCount -= 1;
  }

  private saveCheckpoint(): void {
    this.checkpoint.clear();
    this.cells.forEach((cell: Cell, key: string): void => {
      if (cell.alive) {
        this.checkpoint.add(key);
      }
    });
    this.gameService.setCheckpointGeneration(this.generationCount);
  }

  private returnToCheckpoint(): void {
    this.cells.forEach(cell => cell.alive = false);
    this.checkpoint.forEach(key => {
      const cell: Cell | undefined = this.cells.get(key);
      if (cell) {
        cell.alive = true;
        this.cellsToCheck.add(key);
      }
    });
    this.generationCount = this.gameService.getCheckpointGeneration();
    requestAnimationFrame((): void => { this.drawCells(); });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
