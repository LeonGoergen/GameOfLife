import { Component, OnDestroy, OnInit } from '@angular/core';
import {GameService} from "../../services/game.service";
import {CONTROLS_CONSTANTS, GRID_CONSTANTS} from "../../../app.constants";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-game-controls',
  templateUrl: './game-controls.component.html',
  styleUrls: ['./game-controls.component.css']
})
export class GameControlsComponent implements OnInit, OnDestroy {
  protected highlightedButton: 'play' | 'pause' | null = null;
  protected checkpointGeneration: number = 0;
  private fps: number = 0;

  protected generationsPerSecond: number = 10.0;
  protected toroidalGrid: boolean = true;
  protected gridLines: boolean = true;
  protected maxGenerationsPerSecond: number = CONTROLS_CONSTANTS.MAX_GEN_PER_SECOND;
  protected minGenerationsPerSecond: number = CONTROLS_CONSTANTS.MIN_GEN_PER_SECOND;

  protected userMaxGridSize: number = GRID_CONSTANTS.INIT_GRID_SIZE / GRID_CONSTANTS.CELL_SIZE;
  protected maxGridSize: number = GRID_CONSTANTS.MAX_GRID_SIZE / GRID_CONSTANTS.CELL_SIZE;
  protected minGridSize: number = GRID_CONSTANTS.MIN_GRID_SIZE / GRID_CONSTANTS.CELL_SIZE;

  private subscriptions: Subscription[] = [];

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.gameService.checkpointGeneration$.subscribe((generation) => this.setCheckpointGeneration(generation)),
      this.gameService.fps$.subscribe((fps) => this.setFps(fps))
    );
  }

  protected onNextGenerationClick(): void {
    this.gameService.nextGeneration(true);
  }

  protected onLastGenerationCLick(): void {
    this.gameService.undoLastGeneration();
  }

  protected onStartAutoGenerationClick(): void {
    this.highlightedButton = 'play';
    this.gameService.startAutoGeneration(1000 / this.generationsPerSecond);
  }

  protected onStopAutoGenerationClick(): void {
    this.highlightedButton = 'pause';
    this.gameService.stopAutoGeneration();
  }

  protected onResetGridClick(): void {
    this.gameService.resetGrid();
  }

  protected updateAutoGenerationInterval(): void {
    this.gameService.updateGenerationInterval(1000 / this.generationsPerSecond);
  }

  protected onSaveCheckpointClick(): void {
    this.gameService.saveCheckpoint();
  }

  protected setCheckpointGeneration(generation: number): void {
    this.checkpointGeneration = generation;
  }

  protected onReturnToCheckpointClick(): void {
    this.gameService.returnToCheckpoint();
  }

  protected setUserMaxGridSize(value: number): void {
    this.userMaxGridSize = value;
    this.gameService.updateGridSize(value * GRID_CONSTANTS.CELL_SIZE);
  }

  protected setToroidalGrid(value: boolean): void {
    this.toroidalGrid = value;
    this.gameService.updateToroidalGrid(value);
  }

  protected setGridLines(value: boolean): void {
    this.gridLines = value;
    this.gameService.updateGridLines(value);
  }

  protected setFps(value: number): void {
    this.fps = Math.round(value);
  }

  protected getFpsPercentage(): number {
    return (this.fps / this.maxGenerationsPerSecond) * 100;
  }

  protected getSliderStyle(): any {
    return {'--fps-percentage': `${this.getFpsPercentage()}%`};
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
