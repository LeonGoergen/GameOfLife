import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {GRID_COLORS, GRID_CONSTANTS} from "../app.constants";
import {TransformationMatrixService} from "../services/transformation-matrix.service";
import {Cell} from "./cell/cell";
import {GameService} from "../services/game.service";
import {Subscription} from "rxjs";
import {RleService} from "../services/rle.service";
import {DrawingContext} from "../models/drawing-context.model";
import {GridProperties} from "../models/grid-properties.model";
import {GameProperties} from "../models/game-properties.model";
import {DrawingContextFactoryService} from "../models/factory/drawing-context-factory.service";
import {GridPropertiesFactoryService} from "../models/factory/grid-properties-factory.service";
import {GamePropertiesFactoryService} from "../models/factory/game-properties-factory.service";

@Component({
  selector: 'app-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.css']
})
export class GridComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gridCanvas', { static: true }) gridCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;

  protected drawingContext!: DrawingContext;
  protected gridProperties!: GridProperties;
  protected gameProperties!: GameProperties;

  private subscriptions: Subscription[] = [];

  constructor(private transformationMatrixService: TransformationMatrixService,
              private gameService: GameService,
              private rleService: RleService,
              private drawingContextFactoryService: DrawingContextFactoryService,
              private gridPropertiesFactoryService: GridPropertiesFactoryService,
              private gamePropertiesFactoryService: GamePropertiesFactoryService) {}

  ngOnInit(): void {
    this.drawingContext = this.drawingContextFactoryService.create(this.gridCanvas, this.gameCanvas);
    this.gridProperties = this.gridPropertiesFactoryService.create();
    this.gameProperties = this.gamePropertiesFactoryService.create();
    this.getVisibleGridRange();

    this.subscriptions.push(
      this.gameService.nextGeneration$.subscribe((drawing: boolean) => this.onNextGeneration(drawing)),
      this.gameService.lastGeneration$.subscribe(() => this.onLastGeneration()),
      this.gameService.reset$.subscribe(() => this.initGrid()),
      this.gameService.gridSize$.subscribe((size: number) => this.gridProperties.userGridSize = size),
      this.gameService.toroidalGrid$.subscribe((isToroidal: boolean) => this.gridProperties.isToroidal = isToroidal),
      this.gameService.gridLines$.subscribe((gridLines: boolean) => this.toggleGridLines(gridLines)),
      this.gameService.saveCheckpoint$.subscribe(() => this.saveCheckpoint()),
      this.gameService.returnToCheckpoint$.subscribe(() => this.returnToCheckpoint()),
      this.rleService.rleLoaded$.subscribe((cells: Cell[]) => this.onCellsLoaded(cells)),
  )};

  ngAfterViewInit(): void {
    this.initGrid();
    setInterval(() => this.updateFPSDisplay(), 100);
  }

  private initGrid(): void {
    this.gameProperties.cells.clear();
    this.gameProperties.cellsToCheck.clear();
    this.gameProperties.generationDeltas = [];
    this.gameProperties.generationCount = 0;
    this.gridProperties.gridSize = this.gridProperties.userGridSize;
    this.drawingContext.gridCtx.clearRect(0, 0, this.gridProperties.gridSize, this.gridProperties.gridSize);
    this.drawingContext.gameCtx.clearRect(0, 0, this.gridProperties.gridSize, this.gridProperties.gridSize);
    this.initializeGridCells();
    this.panToMiddle();
    this.getVisibleGridRange();
  }

  private updateFPSDisplay(): void {
    this.gameService.updateFps(this.gameProperties.frameCount * 10);
    this.gameProperties.frameCount = 0;
  }

  private panToMiddle(): void {
    const middleX: number = this.gridProperties.gridSize / 2;
    const middleY: number = this.gridProperties.gridSize / 2;

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
    this.gridProperties.gridLines = gridLines;
    this.drawGridLines();
  }

  private drawGridLines(): void {
    this.drawingContext.gridCtx.clearRect(0, 0, this.gridProperties.gridSize, this.gridProperties.gridSize);

    if (!this.gridProperties.gridLines) { return; }

    this.drawingContext.gridCtx.setTransform(...this.transformationMatrixService.matrix as any);
    this.drawingContext.gridCtx.strokeStyle = GRID_COLORS.GRID_LINE;

    const gridSpacing: number = this.getGridSpacing();

    for (let y: number = 0, i: number= 0; y <= this.gridProperties.gridSize; y += GRID_CONSTANTS.CELL_SIZE * gridSpacing, i += gridSpacing) {
      this.drawingContext.gridCtx.lineWidth = (i % 6 === 0) ? 2 : 0.5;
      this.drawingContext.gridCtx.beginPath();
      this.drawingContext.gridCtx.moveTo(0, y);
      this.drawingContext.gridCtx.lineTo(this.gridProperties.gridSize, y);
      this.drawingContext.gridCtx.stroke();
    }

    for (let x: number = 0, i: number = 0; x <= this.gridProperties.gridSize; x += GRID_CONSTANTS.CELL_SIZE * gridSpacing, i += gridSpacing) {
      this.drawingContext.gridCtx.lineWidth = (i % 6 === 0) ? 2 : 0.5;
      this.drawingContext.gridCtx.beginPath();
      this.drawingContext.gridCtx.moveTo(x, 0);
      this.drawingContext.gridCtx.lineTo(x, this.gridProperties.gridSize);
      this.drawingContext.gridCtx.stroke();
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
    const range: number[] = Array.from({length: this.gridProperties.gridSize / cellSize}, (_, i: number) => i * cellSize);

    const cellPositions: {x: number, y: number}[] = range.flatMap(x => range.map(y => ({ x, y })));

    cellPositions.forEach(({ x, y }) => {
      const cell: Cell = new Cell(x, y, false);
      this.gameProperties.cells.set(cell.key, cell);
      if (cell.alive) { this.gameProperties.cellsToCheck.add(cell.key); }
    });
  }

  private drawCells(): void {
    const startX: number = this.gridProperties.visibleGridRange.startCol * GRID_CONSTANTS.CELL_SIZE;
    const startY: number = this.gridProperties.visibleGridRange.startRow * GRID_CONSTANTS.CELL_SIZE;
    const width: number = (this.gridProperties.visibleGridRange.endCol - this.gridProperties.visibleGridRange.startCol) * GRID_CONSTANTS.CELL_SIZE;
    const height: number = (this.gridProperties.visibleGridRange.endRow - this.gridProperties.visibleGridRange.startRow) * GRID_CONSTANTS.CELL_SIZE;

    this.drawingContext.offscreenCtx.clearRect(startX, startY, width, height);
    this.drawingContext.offscreenCtx.setTransform(...this.transformationMatrixService.matrix as any);
    this.drawingContext.offscreenCtx.fillStyle = GRID_COLORS.DEAD;
    this.drawingContext.offscreenCtx.fillRect(startX, startY, width, height);
    this.drawingContext.offscreenCtx.fillStyle = GRID_COLORS.ALIVE;

    const cellsToCheck: Cell[] = this.getCellsToCheck();
    cellsToCheck.forEach(cell => {
      if (cell.alive)
        this.drawingContext.offscreenCtx.fillRect(cell.x, cell.y, GRID_CONSTANTS.CELL_SIZE, GRID_CONSTANTS.CELL_SIZE);
    });

    this.drawingContext.gameCtx.drawImage(this.drawingContext.offscreenCanvas, 0, 0);
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

    this.gridProperties.visibleGridRange = {startCol, endCol, startRow, endRow};
  }

  private getCellsToCheck(): Cell[] { //TODO: Performance improvement
    const keys: string[] = [];

    for (let x: number = this.gridProperties.visibleGridRange.startCol; x <= this.gridProperties.visibleGridRange.endCol; x++) {
      for (let y: number = this.gridProperties.visibleGridRange.startRow; y <= this.gridProperties.visibleGridRange.endRow; y++) {
        keys.push(`${x * GRID_CONSTANTS.CELL_SIZE},${y * GRID_CONSTANTS.CELL_SIZE}`);
      }
    }

    return keys
      .filter(key => this.gameProperties.cellsToCheck.has(key))
      .map(key => this.gameProperties.cells.get(key))
      .filter((cell): cell is Cell => cell !== undefined);
  }

  protected handlePan(totalPanDistance: number): void {
    this.gridProperties.totalPanDistance = totalPanDistance;
    this.getVisibleGridRange();
    requestAnimationFrame(() => {
      this.drawGridLines();
      this.drawCells();
    });

    setTimeout(() => this.gridProperties.totalPanDistance = 0, 500);
  }

  protected handleZoom(): void {
    this.getVisibleGridRange();
    requestAnimationFrame(() => {
      this.drawGridLines();
      this.drawCells();
    });
  }

  protected handleCanvasClick(key: string): void {
    const cell: Cell | undefined = this.gameProperties.cells.get(key);
    if (!cell) { return; }

    cell.alive = !cell.alive;
    cell.alive ? this.gameProperties.cellsToCheck.add(key) : this.gameProperties.cellsToCheck.delete(key);

    requestAnimationFrame(() => {
      this.drawCells();
    });
  }

  protected async handleRightClick(key: string): Promise<void> {
    const cell: Cell = this.gameProperties.cells.get(key)!;
    const rleString: string = await navigator.clipboard.readText();
    this.rleService.decodeRLE(rleString, cell.x, cell.y);
  }

  private onCellsLoaded(cells: Cell[]): void {
    cells.forEach(cell => {
      this.gameProperties.cells.set(cell.key, cell);
      this.gameProperties.cellsToCheck.add(cell.key);
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

    this.gameProperties.generationDeltas.push(aliveCells);
    if (this.gameProperties.generationDeltas.length > 500) { this.gameProperties.generationDeltas.shift(); }

    this.gameProperties.cellsToCheck = newCellsToCheck;

    if (drawing)
      requestAnimationFrame((): void => { this.drawCells(); });

    if (this.gameProperties.cellsToCheck.size > 0) { this.gameProperties.generationCount += 1; }
    if (this.gameProperties.generationCount === 1000) { console.log(performance.now() - this.startTime); }
    this.gameProperties.frameCount += 1;
  }

  private getNeighborKeys(cell: Cell): string[] {
    return this.gridProperties.isToroidal ? cell.getToroidalNeighbors(this.gridProperties.gridSize) : cell.neighbors;
  }

  private getAllCellsToCheck(): Set<string> {
    const allCellsToCheck: Set<string> = new Set<string>();

    this.gameProperties.cellsToCheck.forEach(key => {
      const cell: Cell | undefined = this.gameProperties.cells.get(key);
      if (!cell) { return; }
      allCellsToCheck.add(key);
      this.getNeighborKeys(cell).forEach(neighborKey => allCellsToCheck.add(neighborKey));
    });

    return allCellsToCheck;
  }

  private determineNewCellState(key: string, aliveCells: Map<string, boolean>): void {
    const cell: Cell | undefined = this.gameProperties.cells.get(key);
    if (!cell) { return; }

    const aliveNeighbors: number = this.getNeighborKeys(cell)
      .reduce((count: number, neighborKey: string) => count + (this.gameProperties.cells.get(neighborKey)?.alive ? 1 : 0), 0);

    const shouldUpdate: boolean = cell.alive ? (aliveNeighbors < 2 || aliveNeighbors > 3) : (aliveNeighbors === 3);

    if (shouldUpdate)
      aliveCells.set(key, !cell.alive);
    else if (cell.alive)
      aliveCells.set(key, cell.alive);
  }

  private convertToSet(aliveCells: Map<string, boolean>, newCellsToCheck: Set<string>): void {
    aliveCells.forEach((newState: boolean, key: string): void => {
      const cell: Cell | undefined = this.gameProperties.cells.get(key);
      if (!cell) { return; }

      cell.alive = newState;
      newCellsToCheck.add(key);
    });
  }

  private onLastGeneration(): void {
    if (this.gameProperties.generationDeltas.length <= 0) { return; }

    const lastGenerationDeltas: Map<string, boolean> = this.gameProperties.generationDeltas.pop()!;

    lastGenerationDeltas.forEach((newState: boolean, key: string): void => {
      const cell: Cell | undefined = this.gameProperties.cells.get(key);
      if (!cell) { return; }

      cell.alive = !newState;
      this.gameProperties.cellsToCheck.add(key);
      this.getNeighborKeys(cell).forEach(neighborKey => this.gameProperties.cellsToCheck.add(neighborKey));
    });

    requestAnimationFrame((): void => { this.drawCells(); });
    this.gameProperties.generationCount -= 1;
  }

  private saveCheckpoint(): void {
    this.gameProperties.checkpoint.clear();
    this.gameProperties.cells.forEach((cell: Cell, key: string): void => {
      if (cell.alive) {
        this.gameProperties.checkpoint.add(key);
      }
    });
    this.gameService.setCheckpointGeneration(this.gameProperties.generationCount);
  }

  private returnToCheckpoint(): void {
    this.gameProperties.cells.forEach(cell => cell.alive = false);
    this.gameProperties.checkpoint.forEach(key => {
      const cell: Cell | undefined = this.gameProperties.cells.get(key);
      if (cell) {
        cell.alive = true;
        this.gameProperties.cellsToCheck.add(key);
      }
    });
    this.gameProperties.generationCount = this.gameService.getCheckpointGeneration();
    requestAnimationFrame((): void => { this.drawCells(); });
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
