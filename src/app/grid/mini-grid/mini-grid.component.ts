import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild
} from '@angular/core';
import {DrawingContext} from "../../models/drawing-context.model";
import {GridProperties} from "../../models/grid-properties.model";
import {GameProperties} from "../../models/game-properties.model";
import {TransformationMatrix} from "../../models/transformation-matrix.model";
import {TransformationMatrixService} from "../../services/transformation-matrix.service";
import {RleService} from "../../services/rle.service";
import {DrawingContextFactoryService} from "../../models/factory/drawing-context-factory.service";
import {GridPropertiesFactoryService} from "../../models/factory/grid-properties-factory.service";
import {GamePropertiesFactoryService} from "../../models/factory/game-properties-factory.service";
import {TransformationMatrixFactoryService} from "../../models/factory/transformation-matrix-factory.service";
import {GameLogicService} from "../../services/game-logic.service";
import {GridRenderingService} from "../../services/grid-rendering.service";
import {MINI_GRID_CONSTANTS} from "../../app.constants";
import {Cell} from "../cell/cell";

@Component({
  selector: 'app-mini-grid',
  templateUrl: './mini-grid.component.html',
  styleUrls: ['./mini-grid.component.css']
})
export class MiniGridComponent implements OnInit, AfterViewInit {
  @ViewChild('gridCanvas', { static: true }) gridCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('gameCanvas', { static: true }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() rleString!: string;

  protected drawingContext!: DrawingContext;
  protected gridProperties!: GridProperties;
  protected gameProperties!: GameProperties;
  protected transformationMatrix!: TransformationMatrix;

  protected autoPlay: boolean = false;

  constructor(private transformationMatrixService: TransformationMatrixService,
              private rleService: RleService,
              private drawingContextFactoryService: DrawingContextFactoryService,
              private gridPropertiesFactoryService: GridPropertiesFactoryService,
              private gamePropertiesFactoryService: GamePropertiesFactoryService,
              private transformationMatrixFactoryService: TransformationMatrixFactoryService,
              private gameLogicService: GameLogicService,
              private gridRenderingService: GridRenderingService) { }

  ngOnInit(): void {
    this.drawingContext = this.drawingContextFactoryService.create(this.gridCanvas, this.gameCanvas, MINI_GRID_CONSTANTS.CANVAS_WIDTH, MINI_GRID_CONSTANTS.CANVAS_HEIGHT);
    this.gridProperties = this.gridPropertiesFactoryService.create(MINI_GRID_CONSTANTS.INIT_GRID_SIZE, MINI_GRID_CONSTANTS.CELL_SIZE);
    this.gameProperties = this.gamePropertiesFactoryService.create();
    this.transformationMatrix = this.transformationMatrixFactoryService.create();
  };

  ngAfterViewInit(): void {
    this.resetGrid();
    this.handleRleString();
    this.drawCells();
  }

  public resetGrid(): void {
    const initializationResults = this.gridRenderingService.initializeGrid(
      this.gridProperties,
      this.gameProperties,
      this.drawingContext,
      this.gridCanvas,
      this.gameCanvas,
      this.transformationMatrix)

    this.gridProperties = initializationResults.gridProperties;
    this.gameProperties = initializationResults.gameProperties;
    this.drawingContext = initializationResults.drawingContext;
  }

  private drawCells(): void {
    this.drawingContext = this.gridRenderingService.drawCells(this.drawingContext, this.gameProperties, this.gridProperties, this.transformationMatrix);
  }

  private drawGridLines(): void {
    this.drawingContext = this.gridRenderingService.drawGridLines(this.drawingContext, this.gridProperties, this.transformationMatrix);
  }

  protected handlePan(totalPanDistance: number): void {
    this.gridProperties.totalPanDistance = totalPanDistance;
    this.gridRenderingService.calculateVisibleGridRange(this.drawingContext, this.gridProperties, this.transformationMatrix);
    requestAnimationFrame(() => { this.drawGridLines(); this.drawCells(); });

    setTimeout(() => this.gridProperties.totalPanDistance = 0, 500);
  }

  protected handleZoom(): void {
    this.gridRenderingService.calculateVisibleGridRange(this.drawingContext, this.gridProperties, this.transformationMatrix);
    requestAnimationFrame(() => { this.drawGridLines(); this.drawCells(); });
  }

  protected handleRleString(): void {
    let cells: Cell[] | null = this.rleService.decodeRLE(this.gridProperties, this.rleString, 60, 60);

    if (!cells) { return; }

    const patternSize = this.getPatternSize(cells);
    const cellSize = this.gridProperties.cellSize;
    const shiftX = Math.round((this.gridProperties.gridSize / 2 - patternSize.width / 2) / cellSize) * cellSize;
    const shiftY = Math.round((this.gridProperties.gridSize / 2 - patternSize.height / 2) / cellSize) * cellSize;

    cells = this.shiftToCenter(cells, shiftX, shiftY);

    cells.forEach(cell => {
      this.gameProperties.cells.set(cell.key, cell);
      this.gameProperties.cellsToCheck.add(cell.key);
    });

    this.drawCells();
  }

  private getPatternSize(cells: Cell[]): { width: number; height: number } {
    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxX = Number.MIN_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;

    cells.forEach(cell => {
      minX = Math.min(minX, cell.x);
      minY = Math.min(minY, cell.y);
      maxX = Math.max(maxX, cell.x);
      maxY = Math.max(maxY, cell.y);
    });

    return { width: maxX - minX + this.gridProperties.cellSize, height: maxY - minY + this.gridProperties.cellSize};
  }

  private shiftToCenter(cells: Cell[], shiftX: number, shiftY: number): Cell[] {
    return cells.map(cell => {
      cell.x += shiftX;
      cell.y += shiftY;
      return cell;
    });
  }

  protected onStartAutoGenerationClick(): void {
    this.autoPlay = true;
    setInterval(() => {
      this.gameProperties = this.gameLogicService.onNextGeneration(this.gridProperties, this.gameProperties)
      requestAnimationFrame((): void => { this.drawCells(); })
    }, 200);
  }
}
