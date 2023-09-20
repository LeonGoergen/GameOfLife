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
  highlightedButton: 'play' | 'pause' | null = null;
  checkpointGeneration: number = 0;
  fps: number = 0;

  generationsPerSecond: number = 10.0;
  toroidalGrid: boolean = true;
  gridLines: boolean = true;
  maxGenerationsPerSecond: number = CONTROLS_CONSTANTS.MAX_GEN_PER_SECOND;
  minGenerationsPerSecond: number = CONTROLS_CONSTANTS.MIN_GEN_PER_SECOND;

  userMaxGridSize: number = GRID_CONSTANTS.INIT_GRID_SIZE / GRID_CONSTANTS.CELL_SIZE;
  maxGridSize: number = GRID_CONSTANTS.MAX_GRID_SIZE / GRID_CONSTANTS.CELL_SIZE;
  minGridSize: number = GRID_CONSTANTS.MIN_GRID_SIZE / GRID_CONSTANTS.CELL_SIZE;

  private subscriptions: Subscription[] = [];

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.gameService.checkpointGeneration$.subscribe((generation) => this.setCheckpointGeneration(generation)),
      this.gameService.fps$.subscribe((fps) => this.setFps(fps))
    );
  }

  onNextGenerationClick(): void {
    this.gameService.nextGeneration();
  }

  onLastGenerationCLick(): void {
    this.gameService.undoLastGeneration();
  }

  onStartAutoGenerationClick(): void {
    this.highlightedButton = 'play';
    this.gameService.startAutoGeneration(1000 / this.generationsPerSecond);
  }

  onStopAutoGenerationClick(): void {
    this.highlightedButton = 'pause';
    this.gameService.stopAutoGeneration();
  }

  onResetGridClick(): void {
    this.gameService.resetGrid();
  }

  updateAutoGenerationInterval(): void {
    this.gameService.updateGenerationInterval(1000 / this.generationsPerSecond);
  }

  onSaveCheckpointClick(): void {
    this.gameService.saveCheckpoint();
  }

  setCheckpointGeneration(generation: number): void {
    this.checkpointGeneration = generation;
  }

  onReturnToCheckpointClick(): void {
    this.gameService.returnToCheckpoint();
  }

  setUserMaxGridSize(value: number): void {
    this.userMaxGridSize = value;
    this.gameService.updateGridSize(value * GRID_CONSTANTS.CELL_SIZE);
  }

  setToroidalGrid(value: boolean): void {
    this.toroidalGrid = value;
    this.gameService.updateToroidalGrid(value);
  }

  setGridLines(value: boolean): void {
    this.gridLines = value;
    this.gameService.updateGridLines(value);
  }

  setFps(value: number): void {
    this.fps = Math.round(value);
  }

  getFpsPercentage(): number {
    return (this.fps / this.maxGenerationsPerSecond) * 100;
  }

  getSliderStyle() {
    return {
      '--fps-percentage': `${this.getFpsPercentage()}%`
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
