import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameInterval: any;
  private generationInterval: number = 1000;

  private nextGenerationSubject = new Subject<void>();
  private lastGenerationSubject = new Subject<void>();
  private resetSubject = new Subject<void>();
  private gridSizeSubject = new Subject<number>();
  private toroidalGridSubject = new Subject<boolean>();
  private GridLinesSubject = new Subject<boolean>();
  private saveCheckpointSubject = new Subject<void>();
  private checkpointGenerationSubject = new Subject<number>();
  private returnToCheckpointSubject = new Subject<void>();
  private fpsSubject = new Subject<number>();

  nextGeneration$ = this.nextGenerationSubject.asObservable();
  lastGeneration$ = this.lastGenerationSubject.asObservable();
  reset$ = this.resetSubject.asObservable();
  gridSize$ = this.gridSizeSubject.asObservable();
  toroidalGrid$ = this.toroidalGridSubject.asObservable();
  gridLines$ = this.GridLinesSubject.asObservable();
  saveCheckpoint$ = this.saveCheckpointSubject.asObservable();
  checkpointGeneration$ = this.checkpointGenerationSubject.asObservable();
  returnToCheckpoint$ = this.returnToCheckpointSubject.asObservable();
  fps$ = this.fpsSubject.asObservable();

  constructor() {}

  startAutoGeneration(interval: number): void {
    this.stopAutoGeneration();
    this.generationInterval = interval;
    this.gameInterval = setInterval(() => {
      this.nextGeneration();
    }, this.generationInterval);
  }

  updateGenerationInterval(interval: number): void {
    this.generationInterval = interval;
    if (this.gameInterval) { this.startAutoGeneration(interval); }
  }

  stopAutoGeneration(): void {
    if (this.gameInterval) {
      clearInterval(this.gameInterval);
      this.gameInterval = null;
    }
  }

  nextGeneration(): void {
    this.nextGenerationSubject.next();
  }

  undoLastGeneration(): void {
    this.lastGenerationSubject.next();
  }

  resetGrid(): void {
    this.resetSubject.next();
  }

  updateGridSize(size: number): void {
    this.gridSizeSubject.next(size);
  }

  updateToroidalGrid(value: boolean): void {
    this.toroidalGridSubject.next(value);
  }

  updateGridLines(value: boolean): void {
    this.GridLinesSubject.next(value);
  }

  saveCheckpoint(): void {
    this.saveCheckpointSubject.next();
  }

  setCheckpointGeneration(generation: number): void {
    this.checkpointGenerationSubject.next(generation);
  }

  returnToCheckpoint(): void {
    this.returnToCheckpointSubject.next();
  }

  updateFps(fps: number): void {
    this.fpsSubject.next(fps);
  }
}
