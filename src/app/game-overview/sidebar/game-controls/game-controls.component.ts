import { Component } from '@angular/core';
import {GameService} from "../../services/game.service";

@Component({
  selector: 'app-game-controls',
  templateUrl: './game-controls.component.html',
  styleUrls: ['./game-controls.component.css']
})
export class GameControlsComponent {
  constructor(private gameService: GameService) {}

  onNextGenerationClick(): void {
    this.gameService.nextGeneration();
  }

  onLastGenerationCLick(): void {
    this.gameService.undoLastGeneration();
  }

  onStartAutoGenerationClick(): void {
    this.gameService.startAutoGeneration(10); // 1000ms interval
  }

  onStopAutoGenerationClick(): void {
    this.gameService.stopAutoGeneration();
  }

  onResetGridClick(): void {
    this.gameService.resetGrid();
  }
}
