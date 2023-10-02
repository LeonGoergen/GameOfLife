import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TransformationMatrixService} from "../services/transformation-matrix.service";
import {Cell} from "./cell/cell";
import {ControlCommunicationService} from "../services/control-communication.service";
import {Subscription} from "rxjs";
import {RleService} from "../services/rle.service";
import {DrawingContext} from "../models/drawing-context.model";
import {GridProperties} from "../models/grid-properties.model";
import {GameProperties} from "../models/game-properties.model";
import {DrawingContextFactoryService} from "../models/factory/drawing-context-factory.service";
import {GridPropertiesFactoryService} from "../models/factory/grid-properties-factory.service";
import {GamePropertiesFactoryService} from "../models/factory/game-properties-factory.service";
import {GameLogicService} from "../services/game-logic.service";
import {GridRenderingService} from "../services/grid-rendering.service";
import {TransformationMatrixFactoryService} from "../models/factory/transformation-matrix-factory.service";
import {TransformationMatrix} from "../models/transformation-matrix.model";
import {MAIN_GRID_CONSTANTS} from "../app.constants";

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
  protected transformationMatrix!: TransformationMatrix;

  private subscriptions: Subscription[] = [];

  constructor(private transformationMatrixService: TransformationMatrixService,
              private gameService: ControlCommunicationService,
              private rleService: RleService,
              private drawingContextFactoryService: DrawingContextFactoryService,
              private gridPropertiesFactoryService: GridPropertiesFactoryService,
              private gamePropertiesFactoryService: GamePropertiesFactoryService,
              private transformationMatrixFactoryService: TransformationMatrixFactoryService,
              private gameLogicService: GameLogicService,
              private gridRenderingService: GridRenderingService) { }

  ngOnInit(): void {
    this.drawingContext = this.drawingContextFactoryService.create(this.gridCanvas, this.gameCanvas, MAIN_GRID_CONSTANTS.CANVAS_WIDTH, MAIN_GRID_CONSTANTS.CANVAS_HEIGHT);
    this.gridProperties = this.gridPropertiesFactoryService.create(MAIN_GRID_CONSTANTS.INIT_GRID_SIZE, MAIN_GRID_CONSTANTS.CELL_SIZE);
    this.gameProperties = this.gamePropertiesFactoryService.create();
    this.transformationMatrix = this.transformationMatrixFactoryService.create();

    this.subscriptions.push(
      this.gameService.nextGeneration$.subscribe((drawing: boolean) => this.onNextGeneration(drawing)),
      this.gameService.lastGeneration$.subscribe(() => this.onLastGeneration()),
      this.gameService.reset$.subscribe(() => this.resetGrid()),
      this.gameService.gridSize$.subscribe((size: number) => this.gridProperties.userGridSize = size),
      this.gameService.toroidalGrid$.subscribe((isToroidal: boolean) => this.gridProperties.isToroidal = isToroidal),
      this.gameService.gridLines$.subscribe((gridLines: boolean) => this.toggleGridLines(gridLines)),
      this.gameService.saveCheckpoint$.subscribe(() => this.saveCheckpoint()),
      this.gameService.returnToCheckpoint$.subscribe(() => this.returnToCheckpoint()),
  )};

  ngAfterViewInit(): void {
    this.resetGrid();
    this.calculateFPS();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private resetGrid(): void {
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

  private toggleGridLines(gridLines: boolean): void {
    this.gridProperties.gridLines = gridLines;
    this.drawGridLines();
  }

  private calculateFPS(): void {
    setInterval(() => {
      this.gameService.updateFps(this.gameProperties.frameCount * 10);
      this.gameProperties.frameCount = 0;
    }, 100);
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

  protected handleCanvasClick(key: string): void {
    const cell: Cell | undefined = this.gameProperties.cells.get(key);
    if (!cell) { return; }

    cell.alive = !cell.alive;
    cell.alive ? this.gameProperties.cellsToCheck.add(key) : this.gameProperties.cellsToCheck.delete(key);

    requestAnimationFrame(() => { this.drawCells(); });
  }

  protected async handleRleStrings(eventData: { key: string; rleString: string }): Promise<void> {
    const cell: Cell = this.gameProperties.cells.get(eventData.key)!;
    const cells: Cell[] | null = this.rleService.decodeRLE(this.gridProperties, eventData.rleString, cell.x, cell.y);

    if (!cells) { return; }

    cells.forEach(cell => {
      this.gameProperties.cells.set(cell.key, cell);
      this.gameProperties.cellsToCheck.add(cell.key);
    });
    requestAnimationFrame(() => { this.drawCells(); });
  }

  private onNextGeneration(drawing: boolean): void {
    this.gameProperties = this.gameLogicService.onNextGeneration(this.gridProperties, this.gameProperties);
    if (drawing) { requestAnimationFrame((): void => { this.drawCells(); }); }
  }

  private onLastGeneration(): void {
    this.gameProperties = this.gameLogicService.onLastGeneration(this.gridProperties, this.gameProperties);
    requestAnimationFrame((): void => { this.drawCells(); });
  }

  private saveCheckpoint(): void {
    this.gameProperties = this.gameLogicService.saveCheckpoint(this.gameProperties);
    this.gameService.setCheckpointGeneration(this.gameProperties.generationCount);
  }

  private returnToCheckpoint(): void {
    this.gameProperties = this.gameLogicService.returnToCheckpoint(this.gameProperties);
    this.gameProperties.generationCount = this.gameService.getCheckpointGeneration();
    requestAnimationFrame((): void => { this.drawCells(); });
  }
}
