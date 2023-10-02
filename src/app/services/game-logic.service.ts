import {Injectable} from '@angular/core';
import {Cell} from "../grid/cell/cell";
import {GameProperties} from "../models/game-properties.model";
import {GridProperties} from "../models/grid-properties.model";

@Injectable({
  providedIn: 'root'
})
export class GameLogicService {
  private startTime: any;

  public onNextGeneration(gridProperties: GridProperties, gameProperties: GameProperties): GameProperties {
    if (!this.startTime) { this.startTime = performance.now(); }
    const newCellsToCheck: Set<string> = new Set<string>();
    const aliveCells: Map<string, boolean> = new Map<string, boolean>();

    const allCellsToCheck: Set<string> = this.getAllCellsToCheck(gridProperties, gameProperties);
    allCellsToCheck.forEach(key => this.determineNewCellState(gridProperties, gameProperties, key, aliveCells));
    this.convertToSet(gameProperties, aliveCells, newCellsToCheck);

    gameProperties.generationDeltas.push(aliveCells);
    if (gameProperties.generationDeltas.length > 500) { gameProperties.generationDeltas.shift(); }

    gameProperties.cellsToCheck = newCellsToCheck;

    if (gameProperties.cellsToCheck.size > 0) { gameProperties.generationCount += 1; }
    //if (gameProperties.generationCount === 1000) { console.log(performance.now() - this.startTime); }
    gameProperties.frameCount += 1;

    return gameProperties;
  }

  private getNeighborKeys(gridProperties: GridProperties, cell: Cell): string[] {
    return gridProperties.isToroidal ? cell.getToroidalNeighbors(gridProperties.gridSize) : cell.neighbors;
  }

  private getAllCellsToCheck(gridProperties: GridProperties, gameProperties: GameProperties): Set<string> {
    const allCellsToCheck: Set<string> = new Set<string>();

    gameProperties.cellsToCheck.forEach(key => {
      const cell: Cell | undefined = gameProperties.cells.get(key);
      if (!cell) { return; }
      allCellsToCheck.add(key);
      this.getNeighborKeys(gridProperties, cell).forEach(neighborKey => allCellsToCheck.add(neighborKey));
    });

    return allCellsToCheck;
  }

  private determineNewCellState(gridProperties: GridProperties, gameProperties: GameProperties, key: string, aliveCells: Map<string, boolean>): void {
    const cell: Cell | undefined = gameProperties.cells.get(key);
    if (!cell) { return; }

    const aliveNeighbors: number = this.getNeighborKeys(gridProperties, cell)
      .reduce((count: number, neighborKey: string) => count + (gameProperties.cells.get(neighborKey)?.alive ? 1 : 0), 0);

    const shouldUpdate: boolean = cell.alive ? (aliveNeighbors < 2 || aliveNeighbors > 3) : (aliveNeighbors === 3);

    if (shouldUpdate)
      aliveCells.set(key, !cell.alive);
    else if (cell.alive)
      aliveCells.set(key, cell.alive);
  }

  private convertToSet(gameProperties: GameProperties, aliveCells: Map<string, boolean>, newCellsToCheck: Set<string>): void {
    aliveCells.forEach((newState: boolean, key: string): void => {
      const cell: Cell | undefined = gameProperties.cells.get(key);
      if (!cell) { return; }

      cell.alive = newState;
      newCellsToCheck.add(key);
    });
  }

  public onLastGeneration(gridProperties: GridProperties, gameProperties: GameProperties): GameProperties {
    if (gameProperties.generationDeltas.length <= 0) { return gameProperties; }

    const lastGenerationDeltas: Map<string, boolean> = gameProperties.generationDeltas.pop()!;

    lastGenerationDeltas.forEach((newState: boolean, key: string): void => {
      const cell: Cell | undefined = gameProperties.cells.get(key);
      if (!cell) { return; }

      cell.alive = !newState;
      gameProperties.cellsToCheck.add(key);
      this.getNeighborKeys(gridProperties, cell).forEach(neighborKey => gameProperties.cellsToCheck.add(neighborKey));
    });

    gameProperties.generationCount -= 1;

    return gameProperties;
  }

  public saveCheckpoint(gameProperties: GameProperties): GameProperties {
    gameProperties.checkpoint.clear();
    gameProperties.cells.forEach((cell: Cell, key: string): void => {
      if (cell.alive) { gameProperties.checkpoint.add(key); }
    });

    return gameProperties;
  }

  public returnToCheckpoint(gameProperties: GameProperties): GameProperties {
    gameProperties.cells.forEach(cell => cell.alive = false);
    gameProperties.checkpoint.forEach(key => {
      const cell: Cell | undefined = gameProperties.cells.get(key);
      if (cell) {
        cell.alive = true;
        gameProperties.cellsToCheck.add(key);
      }
    });

    return gameProperties;
  }
}
