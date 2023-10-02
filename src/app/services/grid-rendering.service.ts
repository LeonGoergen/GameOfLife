import {ElementRef, Injectable} from '@angular/core';
import {GRID_COLORS, MAIN_GRID_CONSTANTS} from "../app.constants";
import {Cell} from "../grid/cell/cell";
import {GridProperties} from "../models/grid-properties.model";
import {GameProperties} from "../models/game-properties.model";
import {TransformationMatrixService} from "./transformation-matrix.service";
import {DrawingContext} from "../models/drawing-context.model";
import {TransformationMatrix} from "../models/transformation-matrix.model";

@Injectable({
  providedIn: 'root'
})
export class GridRenderingService {
  constructor(private transformationMatrixService: TransformationMatrixService) {}

  public initializeGrid(gridProperties: GridProperties,
                        gameProperties: GameProperties,
                        drawingContext: DrawingContext,
                        gridCanvas: ElementRef<HTMLCanvasElement>,
                        gameCanvas: ElementRef<HTMLCanvasElement>,
                        transformationMatrix: TransformationMatrix) {
    gameProperties.cells.clear();
    gameProperties.cellsToCheck.clear();
    gameProperties.generationDeltas = [];
    gameProperties.generationCount = 0;
    gridProperties.gridSize = gridProperties.userGridSize;
    drawingContext.gridCtx.clearRect(0, 0, gridProperties.gridSize, gridProperties.gridSize);
    drawingContext.gameCtx.clearRect(0, 0, gridProperties.gridSize, gridProperties.gridSize);
    gameProperties = this.initializeGridCells(gridProperties, gameProperties);
    this.panToMiddle(gridProperties, gridCanvas, gameCanvas, transformationMatrix);
    requestAnimationFrame((): void => {
      drawingContext = this.drawGridLines(drawingContext, gridProperties, transformationMatrix);
      drawingContext = this.drawCells(drawingContext, gameProperties, gridProperties, transformationMatrix);
    });

    return { gameProperties, gridProperties, drawingContext }
  }

  private initializeGridCells(gridProperties: GridProperties, gameProperties: GameProperties): GameProperties {
    const cellSize: number = gridProperties.cellSize;
    const range: number[] = Array.from({length: gridProperties.gridSize / cellSize}, (_, i: number) => i * cellSize);

    const cellPositions: {x: number, y: number}[] = range.flatMap(x => range.map(y => ({ x, y })));

    cellPositions.forEach(({ x, y }) => {
      const cell: Cell = new Cell(x, y, false, cellSize);
      gameProperties.cells.set(cell.key, cell);
      if (cell.alive) { gameProperties.cellsToCheck.add(cell.key); }
    });

    return gameProperties;
  }

  private panToMiddle(gridProperties: GridProperties,
                      gridCanvas: ElementRef<HTMLCanvasElement>,
                      gameCanvas: ElementRef<HTMLCanvasElement>,
                      transformationMatrix: TransformationMatrix): void {
    const middleX: number = gridProperties.gridSize / 2;
    const middleY: number = gridProperties.gridSize / 2;

    const canvasRect: DOMRect = gridCanvas.nativeElement.getBoundingClientRect();
    const canvasMiddleX: number = canvasRect.width / 2;
    const canvasMiddleY: number = canvasRect.height / 2;

    const translateX: number = canvasMiddleX - middleX;
    const translateY: number = canvasMiddleY - middleY;

    transformationMatrix = this.transformationMatrixService.setTransform(transformationMatrix, 1, 0, 0, 1, translateX, translateY);
    this.calculateVisibleGridRange(gameCanvas, gridProperties, transformationMatrix);
  }

  public calculateVisibleGridRange(gameCanvas: ElementRef<HTMLCanvasElement>,
                                   gridProperties: GridProperties,
                                   transformationMatrix: TransformationMatrix): void {
    const rect: DOMRect = gameCanvas.nativeElement.getBoundingClientRect();

    const inverseMatrix: number[] = this.transformationMatrixService.getInverseMatrix(transformationMatrix);
    const topLeft: {x: number, y:number} = this.transformationMatrixService.transformPoint({x: 0, y: 0}, inverseMatrix);
    const bottomRight: {x: number, y:number} = this.transformationMatrixService.transformPoint({x: rect.width, y: rect.height}, inverseMatrix);

    const startCol: number = Math.floor(topLeft.x / gridProperties.cellSize);
    const endCol: number = Math.ceil(bottomRight.x / gridProperties.cellSize);
    const startRow: number = Math.floor(topLeft.y / gridProperties.cellSize);
    const endRow: number = Math.ceil(bottomRight.y / gridProperties.cellSize);

    gridProperties.visibleGridRange = {startCol, endCol, startRow, endRow};
  }

  public drawGridLines(drawingContext: DrawingContext,
                       gridProperties: GridProperties,
                       transformationMatrix: TransformationMatrix): DrawingContext {
    drawingContext.gridCtx.clearRect(0, 0, gridProperties.gridSize, gridProperties.gridSize);

    if (!gridProperties.gridLines) { return drawingContext; }

    drawingContext.gridCtx.setTransform(...this.transformationMatrixService.unpack(transformationMatrix));
    drawingContext.gridCtx.strokeStyle = GRID_COLORS.GRID_LINE;

    const gridSpacing: number = this.getGridSpacing(transformationMatrix);

    for (let y: number = 0, i: number= 0; y <= gridProperties.gridSize; y += gridProperties.cellSize * gridSpacing, i += gridSpacing) {
      drawingContext.gridCtx.lineWidth = (i % 6 === 0) ? 2 : 0.5;
      drawingContext.gridCtx.beginPath();
      drawingContext.gridCtx.moveTo(0, y);
      drawingContext.gridCtx.lineTo(gridProperties.gridSize, y);
      drawingContext.gridCtx.stroke();
    }

    for (let x: number = 0, i: number = 0; x <= gridProperties.gridSize; x += gridProperties.cellSize * gridSpacing, i += gridSpacing) {
      drawingContext.gridCtx.lineWidth = (i % 6 === 0) ? 2 : 0.5;
      drawingContext.gridCtx.beginPath();
      drawingContext.gridCtx.moveTo(x, 0);
      drawingContext.gridCtx.lineTo(x, gridProperties.gridSize);
      drawingContext.gridCtx.stroke();
    }

    return drawingContext;
  }

  private getGridSpacing(transformationMatrix: TransformationMatrix): number {
    const zoomLevel: number = this.transformationMatrixService.unpack(transformationMatrix)[0];
    let gridSpacing: number;

    const division: number = MAIN_GRID_CONSTANTS.ZOOM_LEVEL_THRESHOLD / zoomLevel;
    gridSpacing = Math.pow(2, Math.ceil(Math.log2(division)));

    return gridSpacing;
  }

  public drawCells(drawingContext: DrawingContext,
                   gameProperties: GameProperties,
                   gridProperties: GridProperties,
                   transformationMatrix: TransformationMatrix): DrawingContext {
    const startX: number = gridProperties.visibleGridRange.startCol * gridProperties.cellSize;
    const startY: number = gridProperties.visibleGridRange.startRow * gridProperties.cellSize;
    const width: number = (gridProperties.visibleGridRange.endCol - gridProperties.visibleGridRange.startCol) * gridProperties.cellSize;
    const height: number = (gridProperties.visibleGridRange.endRow - gridProperties.visibleGridRange.startRow) * gridProperties.cellSize;

    drawingContext.offscreenCtx.clearRect(startX, startY, width, height);
    drawingContext.offscreenCtx.setTransform(...this.transformationMatrixService.unpack(transformationMatrix));
    drawingContext.offscreenCtx.fillStyle = GRID_COLORS.DEAD;
    drawingContext.offscreenCtx.fillRect(startX, startY, width, height);
    drawingContext.offscreenCtx.fillStyle = GRID_COLORS.ALIVE;

    const cellsToCheck: Cell[] = this.getCellsToCheck(gameProperties, gridProperties);
    cellsToCheck.forEach(cell => {
      if (cell.alive)
        drawingContext.offscreenCtx.fillRect(cell.x, cell.y, gridProperties.cellSize, gridProperties.cellSize);
    });

    drawingContext.gameCtx.drawImage(drawingContext.offscreenCanvas, 0, 0);

    return drawingContext;
  }

  private getCellsToCheck(gameProperties: GameProperties, gridProperties: GridProperties): Cell[] {
    const keys: string[] = [];

    for (let x: number = gridProperties.visibleGridRange.startCol; x <= gridProperties.visibleGridRange.endCol; x++) {
      for (let y: number = gridProperties.visibleGridRange.startRow; y <= gridProperties.visibleGridRange.endRow; y++) {
        keys.push(`${x * gridProperties.cellSize},${y * gridProperties.cellSize}`);
      }
    }

    return keys
      .filter(key => gameProperties.cellsToCheck.has(key))
      .map(key => gameProperties.cells.get(key))
      .filter((cell): cell is Cell => cell !== undefined);
  }
}
