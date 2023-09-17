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

  nextGeneration$ = this.nextGenerationSubject.asObservable();
  lastGeneration$ = this.lastGenerationSubject.asObservable();
  reset$ = this.resetSubject.asObservable();
  gridSize$ = this.gridSizeSubject.asObservable();
  toroidalGrid$ = this.toroidalGridSubject.asObservable();

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
}
