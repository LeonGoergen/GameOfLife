import {ElementRef, Injectable} from '@angular/core';
import {GRID_COLORS, GRID_CONSTANTS} from "../app.constants";
import {Cell} from "../grid/cell/cell";
import {GridProperties} from "../models/grid-properties.model";
import {GameProperties} from "../models/game-properties.model";
import {TransformationMatrixService} from "./transformation-matrix.service";
import {DrawingContext} from "../models/drawing-context.model";

@Injectable({
  providedIn: 'root'
})
export class GridRenderingService {
  private visibleGridRange!: {startCol: number, endCol: number, startRow: number, endRow: number};

  constructor(private transformationMatrixService: TransformationMatrixService) {}

  public initializeGrid(gridProperties: GridProperties,
                        gameProperties: GameProperties,
                        drawingContext: DrawingContext,
                        gridCanvas: ElementRef<HTMLCanvasElement>,
                        gameCanvas: ElementRef<HTMLCanvasElement>) {
    gameProperties.cells.clear();
    gameProperties.cellsToCheck.clear();
    gameProperties.generationDeltas = [];
    gameProperties.generationCount = 0;
    gridProperties.gridSize = gridProperties.userGridSize;
    drawingContext.gridCtx.clearRect(0, 0, gridProperties.gridSize, gridProperties.gridSize);
    drawingContext.gameCtx.clearRect(0, 0, gridProperties.gridSize, gridProperties.gridSize);
    gameProperties = this.initializeGridCells(gridProperties, gameProperties);
    this.panToMiddle(gridProperties, gridCanvas, gameCanvas);
    requestAnimationFrame((): void => {
      drawingContext = this.drawGridLines(drawingContext, gridProperties);
      drawingContext = this.drawCells(drawingContext, gameProperties);
    });

    return { gameProperties, gridProperties, drawingContext }
  }

  private initializeGridCells(gridProperties: GridProperties, gameProperties: GameProperties): GameProperties {
    const cellSize: number = GRID_CONSTANTS.CELL_SIZE;
    const range: number[] = Array.from({length: gridProperties.gridSize / cellSize}, (_, i: number) => i * cellSize);

    const cellPositions: {x: number, y: number}[] = range.flatMap(x => range.map(y => ({ x, y })));

    cellPositions.forEach(({ x, y }) => {
      const cell: Cell = new Cell(x, y, false);
      gameProperties.cells.set(cell.key, cell);
      if (cell.alive) { gameProperties.cellsToCheck.add(cell.key); }
    });

    return gameProperties;
  }

  private panToMiddle(gridProperties: GridProperties, gridCanvas: ElementRef<HTMLCanvasElement>, gameCanvas: ElementRef<HTMLCanvasElement>): void {
    const middleX: number = gridProperties.gridSize / 2;
    const middleY: number = gridProperties.gridSize / 2;

    const canvasRect: DOMRect = gridCanvas.nativeElement.getBoundingClientRect();
    const canvasMiddleX: number = canvasRect.width / 2;
    const canvasMiddleY: number = canvasRect.height / 2;

    const translateX: number = canvasMiddleX - middleX;
    const translateY: number = canvasMiddleY - middleY;

    this.transformationMatrixService.setTransform(1, 0, 0, 1, translateX, translateY);
    this.calculateVisibleGridRange(gameCanvas);
  }

  public calculateVisibleGridRange(gameCanvas: ElementRef<HTMLCanvasElement>): void {
    const rect: DOMRect = gameCanvas.nativeElement.getBoundingClientRect();

    const inverseMatrix: number[] = this.transformationMatrixService.inverseMatrix;
    const topLeft: {x: number, y:number} = this.transformationMatrixService.transformPoint({x: 0, y: 0}, inverseMatrix);
    const bottomRight: {x: number, y:number} = this.transformationMatrixService.transformPoint({x: rect.width, y: rect.height}, inverseMatrix);

    const startCol: number = Math.floor(topLeft.x / GRID_CONSTANTS.CELL_SIZE);
    const endCol: number = Math.ceil(bottomRight.x / GRID_CONSTANTS.CELL_SIZE);
    const startRow: number = Math.floor(topLeft.y / GRID_CONSTANTS.CELL_SIZE);
    const endRow: number = Math.ceil(bottomRight.y / GRID_CONSTANTS.CELL_SIZE);

    this.visibleGridRange = {startCol, endCol, startRow, endRow};
  }

  public drawGridLines(drawingContext: DrawingContext, gridProperties: GridProperties): DrawingContext {
    drawingContext.gridCtx.clearRect(0, 0, gridProperties.gridSize, gridProperties.gridSize);

    if (!gridProperties.gridLines) { return drawingContext; }

    drawingContext.gridCtx.setTransform(...this.transformationMatrixService.matrix as any);
    drawingContext.gridCtx.strokeStyle = GRID_COLORS.GRID_LINE;

    const gridSpacing: number = this.getGridSpacing();

    for (let y: number = 0, i: number= 0; y <= gridProperties.gridSize; y += GRID_CONSTANTS.CELL_SIZE * gridSpacing, i += gridSpacing) {
      drawingContext.gridCtx.lineWidth = (i % 6 === 0) ? 2 : 0.5;
      drawingContext.gridCtx.beginPath();
      drawingContext.gridCtx.moveTo(0, y);
      drawingContext.gridCtx.lineTo(gridProperties.gridSize, y);
      drawingContext.gridCtx.stroke();
    }

    for (let x: number = 0, i: number = 0; x <= gridProperties.gridSize; x += GRID_CONSTANTS.CELL_SIZE * gridSpacing, i += gridSpacing) {
      drawingContext.gridCtx.lineWidth = (i % 6 === 0) ? 2 : 0.5;
      drawingContext.gridCtx.beginPath();
      drawingContext.gridCtx.moveTo(x, 0);
      drawingContext.gridCtx.lineTo(x, gridProperties.gridSize);
      drawingContext.gridCtx.stroke();
    }

    return drawingContext;
  }

  private getGridSpacing(): number {
    const zoomLevel: number = this.transformationMatrixService.matrix[0];
    let gridSpacing: number;

    const division: number = GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD / zoomLevel;
    gridSpacing = Math.pow(2, Math.ceil(Math.log2(division)));

    return gridSpacing;
  }

  public drawCells(drawingContext: DrawingContext, gameProperties: GameProperties): DrawingContext {
    const startX: number = this.visibleGridRange.startCol * GRID_CONSTANTS.CELL_SIZE;
    const startY: number = this.visibleGridRange.startRow * GRID_CONSTANTS.CELL_SIZE;
    const width: number = (this.visibleGridRange.endCol - this.visibleGridRange.startCol) * GRID_CONSTANTS.CELL_SIZE;
    const height: number = (this.visibleGridRange.endRow - this.visibleGridRange.startRow) * GRID_CONSTANTS.CELL_SIZE;

    drawingContext.offscreenCtx.clearRect(startX, startY, width, height);
    drawingContext.offscreenCtx.setTransform(...this.transformationMatrixService.matrix as any);
    drawingContext.offscreenCtx.fillStyle = GRID_COLORS.DEAD;
    drawingContext.offscreenCtx.fillRect(startX, startY, width, height);
    drawingContext.offscreenCtx.fillStyle = GRID_COLORS.ALIVE;

    const cellsToCheck: Cell[] = this.getCellsToCheck(gameProperties);
    cellsToCheck.forEach(cell => {
      if (cell.alive)
        drawingContext.offscreenCtx.fillRect(cell.x, cell.y, GRID_CONSTANTS.CELL_SIZE, GRID_CONSTANTS.CELL_SIZE);
    });

    drawingContext.gameCtx.drawImage(drawingContext.offscreenCanvas, 0, 0);

    return drawingContext;
  }

  private getCellsToCheck(gameProperties: GameProperties): Cell[] { //TODO: Performance improvement
    const keys: string[] = [];

    for (let x: number = this.visibleGridRange.startCol; x <= this.visibleGridRange.endCol; x++) {
      for (let y: number = this.visibleGridRange.startRow; y <= this.visibleGridRange.endRow; y++) {
        keys.push(`${x * GRID_CONSTANTS.CELL_SIZE},${y * GRID_CONSTANTS.CELL_SIZE}`);
      }
    }

    return keys
      .filter(key => gameProperties.cellsToCheck.has(key))
      .map(key => gameProperties.cells.get(key))
      .filter((cell): cell is Cell => cell !== undefined);
  }
}
