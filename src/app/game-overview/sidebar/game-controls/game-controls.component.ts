import { Component } from '@angular/core';
import {GameService} from "../../services/game.service";
import {CONTROLS_CONSTANTS, GRID_CONSTANTS} from "../../../app.constants";

@Component({
  selector: 'app-game-controls',
  templateUrl: './game-controls.component.html',
  styleUrls: ['./game-controls.component.css']
})
export class GameControlsComponent {
  generationsPerSecond: number = 3.0;
  toroidalGrid: boolean = true;
  maxGenerationsPerSecond: number = CONTROLS_CONSTANTS.MAX_GEN_PER_SECOND;
  minGenerationsPerSecond: number = CONTROLS_CONSTANTS.MIN_GEN_PER_SECOND;

  userMaxGridSize: number = GRID_CONSTANTS.INIT_GRID_SIZE / GRID_CONSTANTS.CELL_SIZE;
  maxGridSize: number = GRID_CONSTANTS.MAX_GRID_SIZE / GRID_CONSTANTS.CELL_SIZE;
  minGridSize: number = GRID_CONSTANTS.MIN_GRID_SIZE / GRID_CONSTANTS.CELL_SIZE;

  constructor(private gameService: GameService) {}

  onNextGenerationClick(): void {
    this.gameService.nextGeneration();
  }

  onLastGenerationCLick(): void {
    this.gameService.undoLastGeneration();
  }

  onStartAutoGenerationClick(): void {
    this.gameService.startAutoGeneration(1000 / this.generationsPerSecond);
  }

  onStopAutoGenerationClick(): void {
    this.gameService.stopAutoGeneration();
  }

  onResetGridClick(): void {
    this.gameService.resetGrid();
  }

  updateAutoGenerationInterval(): void {
    this.gameService.updateGenerationInterval(1000 / this.generationsPerSecond);
  }

  setUserMaxGridSize(value: number): void {
    this.userMaxGridSize = value;
    this.gameService.updateGridSize(value * GRID_CONSTANTS.CELL_SIZE);
  }

  setToroidalGrid(value: boolean): void {
    this.toroidalGrid = value;
    this.gameService.updateToroidalGrid(value);
  }
}
