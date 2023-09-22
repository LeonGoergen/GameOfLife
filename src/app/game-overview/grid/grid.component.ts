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

  private gridCtx!: CanvasRenderingContext2D;
  private gameCtx!: CanvasRenderingContext2D;

  private gridSize!: number;
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

  private panConfig = {
    isPanning: false,
    lastPanX: 0,
    lastPanY: 0,
    totalPanDistance: 0,
  };

  private subscriptions: Subscription[] = [];

  constructor(private transformationMatrixService: TransformationMatrixService,
              private gameService: GameService,
              private rleService: RleService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.gameService.nextGeneration$.subscribe(() => this.onNextGeneration()),
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

    if (!this.gridLines) {
      return;
    }

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
    let gridSpacing: number = 1;

    if (zoomLevel <= GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD && zoomLevel > GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD / 2) {
      gridSpacing = 2;
    } else if (zoomLevel <= GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD / 2 && zoomLevel > GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD / 4) {
      gridSpacing = 4;
    } else if (zoomLevel <= GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD / 4 && zoomLevel > GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD / 8) {
      gridSpacing = 8;
    } else if (zoomLevel <= GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD / 8 && zoomLevel > GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD / 16) {
      gridSpacing = 16;
    } else if (zoomLevel <= GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD / 16 && zoomLevel > GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD / 32) {
      gridSpacing = 32;
    }

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
    this.gameCtx.clearRect(0, 0, this.gridSize, this.gridSize);
    this.gameCtx.setTransform(...this.transformationMatrixService.matrix as any);

    this.gameCtx.fillStyle = GRID_COLORS.DEAD;
    this.gameCtx.fillRect(0, 0, this.gridSize, this.gridSize);

    this.gameCtx.fillStyle = GRID_COLORS.ALIVE;

    const cellsToCheck: Cell[] = this.getCellsToCheck();
    cellsToCheck.forEach(cell => {
      if (cell.alive)
        this.gameCtx.fillRect(cell.x, cell.y, GRID_CONSTANTS.CELL_SIZE, GRID_CONSTANTS.CELL_SIZE);
    });
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

  protected startPan(event: MouseEvent): void {
    this.panConfig.isPanning = true;
    this.panConfig.lastPanX = event.clientX;
    this.panConfig.lastPanY = event.clientY;
    this.panConfig.totalPanDistance = 0;
  }

  protected pan(event: MouseEvent): void {
    if (!this.panConfig.isPanning) { return; }

    const deltaX: number = event.clientX - this.panConfig.lastPanX;
    const deltaY: number = event.clientY - this.panConfig.lastPanY;

    this.transformationMatrixService.translate(deltaX, deltaY, this.gridSize);

    this.panConfig.lastPanX = event.clientX;
    this.panConfig.lastPanY = event.clientY;

    this.panConfig.totalPanDistance += Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    this.getVisibleGridRange();

    requestAnimationFrame(() => {
      this.drawGridLines();
      this.drawCells();
    });
  }

  protected endPan(): void {
    this.panConfig.isPanning = false;
  }

  protected zoom(event: WheelEvent): void {
    event.preventDefault();

    const rect: DOMRect = this.gridCanvas.nativeElement.getBoundingClientRect();

    const x: number = event.clientX - rect.left;
    const y: number = event.clientY - rect.top;

    const amount: number = 1 - event.deltaY * GRID_CONSTANTS.ZOOM_FACTOR;
    this.transformationMatrixService.scaleAt({ x, y }, amount, this.gridSize);

    this.getVisibleGridRange();

    requestAnimationFrame(() => {
      this.drawGridLines();
      this.drawCells();
    });
  }

  protected onCanvasClick(event: MouseEvent): void {
    if (this.panConfig.totalPanDistance > GRID_CONSTANTS.PAN_DISTANCE_THRESHOLD) { return; }

    const key: string = this.getCellKeyByCoordinates(event);
    const cell: Cell | undefined = this.cells.get(key);

    if (!cell) { return; }

    cell.alive = !cell.alive;
    cell.alive ? this.cellsToCheck.add(key) : this.cellsToCheck.delete(key);

    this.drawCells();
  }

  protected async onRightClick(event: MouseEvent): Promise<void> {
    event.preventDefault();
    const key: string = this.getCellKeyByCoordinates(event);
    const cell: Cell = this.cells.get(key)!;
    const rleString: string = await navigator.clipboard.readText();
    this.rleService.decodeRLE(rleString, cell.x, cell.y);
  }

  private onCellsLoaded(cells: Cell[]): void {
    cells.forEach(cell => {
      this.cells.set(cell.key, cell);
      this.cellsToCheck.add(cell.key);
    });

    this.drawCells();
  }

  private getCellKeyByCoordinates(event: MouseEvent): string {
    const rect: DOMRect = this.gameCanvas.nativeElement.getBoundingClientRect();
    const x: number = event.clientX - rect.left;
    const y: number = event.clientY - rect.top;

    const inverseMatrix: number[] = this.transformationMatrixService.inverseMatrix;
    const worldPoint: {x: number, y:number} = this.transformationMatrixService.transformPoint({ x, y }, inverseMatrix);

    const cellX: number = Math.floor(worldPoint.x / GRID_CONSTANTS.CELL_SIZE) * GRID_CONSTANTS.CELL_SIZE;
    const cellY: number = Math.floor(worldPoint.y / GRID_CONSTANTS.CELL_SIZE) * GRID_CONSTANTS.CELL_SIZE;
    return `${cellX},${cellY}`;
  }

  private startTime: any;

  private onNextGeneration(): void {
    if (!this.startTime) { this.startTime = performance.now(); }
    const newCellsToCheck: Set<string> = new Set<string>();
    const aliveCells: Map<string, boolean> = new Map<string, boolean>();

    const allCellsToCheck: Set<string> = this.getAllCellsToCheck();
    allCellsToCheck.forEach(key => this.determineNewCellState(key, aliveCells));
    this.convertToSet(aliveCells, newCellsToCheck);

    this.generationDeltas.push(aliveCells);
    if (this.generationDeltas.length > 500) { this.generationDeltas.shift(); }

    this.cellsToCheck = newCellsToCheck;
    requestAnimationFrame((): void => { this.drawCells(); });

    if (this.cellsToCheck.size > 0) { this.generationCount += 1; }
    if (this.generationCount === 1000) { console.log(performance.now() - this.startTime); }
    this.frameCount += 1;
  }

  private getNeighborKeys(cell: Cell): string[] {
    const neighbors = this.isToroidal ? cell.getToroidalNeighbors(this.gridSize) : cell.neighbors;
    return Object.values(neighbors).map(neighbor => `${neighbor.x},${neighbor.y}`);
  }

  private getAllCellsToCheck(): Set<string> {
    const allCellsToCheck: Set<string> = new Set<string>();
    this.cellsToCheck.forEach(key => {
      allCellsToCheck.add(key);
      const cell: Cell | undefined = this.cells.get(key);
      if (cell) {
        this.getNeighborKeys(cell).forEach(neighborKey => allCellsToCheck.add(neighborKey));
      }
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
